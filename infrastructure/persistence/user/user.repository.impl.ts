import { Model } from 'mongoose';
import { IUserRepository } from '@/core/user/user.repository';
import { User } from '@/core/user/user.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

export class UserRepository implements IUserRepository {
  constructor(private userModel: Model<any>) {}

  async create(data: Partial<User>): Promise<User> {
    // Check if user with email or username already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      throw new ConflictError(
        existingUser.email === data.email
          ? 'Email already registered'
          : 'Username already taken'
      );
    }

    const user = new this.userModel(data);
    await user.save();
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).lean();
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).select('+password').lean();
    return user ? this.mapToEntity(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username }).select('+password').lean();
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Check if email or username is being updated
    if (data.email || data.username) {
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: data.email, _id: { $ne: id } },
          { username: data.username, _id: { $ne: id } },
        ],
      });

      if (existingUser) {
        throw new ConflictError(
          existingUser.email === data.email
            ? 'Email already in use'
            : 'Username already taken'
        );
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: data, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.mapToEntity(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('User not found');
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(),
    ]);

    return {
      items: users.map((user) => this.mapToEntity(user)),
      total,
    };
  }

  private mapToEntity(doc: any): User {
    return {
      id: doc._id?.toString() || doc.id,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      name: doc.name,
      avatar: doc.avatar,
      role: doc.role,
      bio: doc.bio,
      phone: doc.phone,
      address: doc.address,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
