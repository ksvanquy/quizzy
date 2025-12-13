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
    const expiresIn = getAccessTokenExpiry(); // in seconds

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
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
  }
}
