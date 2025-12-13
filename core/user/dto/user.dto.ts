/**
 * User DTOs - Data Transfer Objects for user operations
 */

// Create User DTO
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'teacher' | 'student';
}

// Update User DTO
export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
}

// User Response DTO
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'teacher' | 'student';
  bio?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Change Password DTO
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
