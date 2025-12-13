/**
 * User Entity - Domain model for user
 * Pure domain logic, no database details
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
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

export class UserEntity implements User {
  id: string;
  username: string;
  email: string;
  password: string;
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

  constructor(data: User) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.avatar = data.avatar;
    this.role = data.role;
    this.bio = data.bio;
    this.phone = data.phone;
    this.address = data.address;
    this.isActive = data.isActive;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isTeacher(): boolean {
    return this.role === 'teacher';
  }

  isStudent(): boolean {
    return this.role === 'student';
  }
}
