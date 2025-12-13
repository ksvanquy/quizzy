/**
 * Auth DTOs - Data Transfer Objects for authentication operations
 */

// Login DTO
export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}

// Register DTO
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

// Auth Response DTO
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: 'Bearer';
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
  };
}

// Refresh Token DTO
export interface RefreshTokenDto {
  refreshToken: string;
}

// Change Password DTO
export interface ChangePasswordAuthDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Verify Credentials DTO
export interface VerifyCredentialsDto {
  password: string;
}
