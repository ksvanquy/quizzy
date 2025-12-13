import { User } from '../../user/user.entity';
import { AuthResponseDto } from './auth.dto';
import { generateAccessToken, generateRefreshToken, getAccessTokenExpiry } from '@/lib/utils/jwt';

/**
 * Auth Mapper - Convert between Auth data and DTOs
 */
export class AuthMapper {
  /**
   * Convert User entity and tokens to AuthResponseDto
   */
  static toAuthResponseDto(user: User, accessToken: string, refreshToken: string): AuthResponseDto {
    // 7 days = 7 * 24 * 60 * 60 = 604800 seconds
    const expiresIn = 604800; // 7 days in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Create new tokens for user
   */
  static createTokens(user: User): { accessToken: string; refreshToken: string } {
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { accessToken, refreshToken };
  }
}
