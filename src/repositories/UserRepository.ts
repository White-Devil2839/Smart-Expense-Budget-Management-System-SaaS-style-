import { User, IUser } from '../models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async findAll(): Promise<IUser[]> {
    return User.find().select('-password');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }
}
