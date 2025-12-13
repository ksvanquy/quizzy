import { User, UserEntity } from './user.entity';
import { IUserRepository } from './user.repository';
import { NotFoundError, ConflictError } from '../shared/errors';
import { hashPassword, comparePassword } from '@/lib/utils/password';
import { REGEX_PATTERNS } from '@/constants/app.constants';

/**
 * User Service - Business logic for user management
 * Handles user creation, updates, password changes, and authentication checks
 */
export class UserService {
  constructor(private repository: IUserRepository) {}

  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'teacher' | 'student';
  }): Promise<User> {
    // Validate username
    if (!REGEX_PATTERNS.USERNAME.test(data.username)) {
      throw new Error('Invalid username format');
    }

    // Validate email
    if (!REGEX_PATTERNS.EMAIL.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!REGEX_PATTERNS.PASSWORD.test(data.password)) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if email already exists
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.repository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User with email', email);
    }
    return user;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const user = await this.repository.findByUsername(username);
    if (!user) {
      throw new NotFoundError('User with username', username);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateUser(
    id: string,
    data: {
      name?: string;
      avatar?: string;
      bio?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<User> {
    const user = await this.getUserById(id);

    const updated = await this.repository.update(id, {
      ...data,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.getUserById(userId);

    // Verify old password
    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    // Validate new password
    if (!REGEX_PATTERNS.PASSWORD.test(newPassword)) {
      throw new Error('New password must be at least 6 characters');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.repository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return comparePassword(password, user.password);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<void> {
    await this.getUserById(id);
    await this.repository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<void> {
    await this.getUserById(id);
    await this.repository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.repository.update(userId, {
      lastLogin: new Date(),
    });
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ items: User[]; total: number }> {
    return this.repository.findAll(page, limit);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await this.getUserById(id);
    await this.repository.delete(id);
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.role === 'admin';
  }

  /**
   * Check if user is teacher
   */
  async isTeacher(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.role === 'teacher';
  }

  /**
   * Check if user is student
   */
  async isStudent(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.role === 'student';
  }
}
