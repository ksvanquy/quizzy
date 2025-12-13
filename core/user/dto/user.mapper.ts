import { User } from '../user.entity';
import { UserResponseDto } from './user.dto';

/**
 * User Mapper - Convert between User entity and UserResponseDto
 */
export class UserMapper {
  /**
   * Convert User entity to UserResponseDto
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convert array of User entities to UserResponseDtos
   */
  static toResponseDtos(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
