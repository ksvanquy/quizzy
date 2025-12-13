import { User } from '../user/user.entity';
import { IUserRepository } from '../user/user.repository';
import { UnauthorizedError, ConflictError } from '../shared/errors';
import { hashPassword, comparePassword } from '@/lib/utils/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/utils/jwt';
import { REGEX_PATTERNS } from '@/constants/app.constants';

/**
 * Auth Service - Business logic for authentication
 * Handles login, register, token generation, password reset
 */
export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Register new user
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Validate inputs
    if (!REGEX_PATTERNS.USERNAME.test(data.username)) {
      throw new Error('Invalid username format');
    }

    if (!REGEX_PATTERNS.EMAIL.test(data.email)) {
      throw new Error('Invalid email format');
    }

    if (!REGEX_PATTERNS.PASSWORD.test(data.password)) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if email exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with student role by default
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Validate email format
    if (!REGEX_PATTERNS.EMAIL.test(email)) {
      throw new Error('Invalid email format');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login by username
   */
  async loginByUsername(
    username: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user by username
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Generate new tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken };
  }

  /**
   * Validate credentials (for 2FA or additional verification)
   */
  async validateCredentials(userId: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    return comparePassword(password, user.password);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify old password
    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password
    if (!REGEX_PATTERNS.PASSWORD.test(newPassword)) {
      throw new Error('New password must be at least 6 characters');
    }

    if (oldPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  /**
   * Verify user is authorized (for endpoint checks)
   */
  async verifyAuthorization(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    return user;
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<User> {
    return this.verifyAuthorization(userId);
  }
}
