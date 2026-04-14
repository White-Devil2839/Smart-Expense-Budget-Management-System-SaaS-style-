import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { generateToken } from '../utils/jwt';
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  AuthResponseDTO,
} from '../types/dto';
import { IUser } from '../models/User';

const userRepository = new UserRepository();

export class AuthService {
  async register(data: RegisterRequestDTO): Promise<IUser> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'USER',
    });
  }

  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(String(user._id), user.role);

    return {
      accessToken: token,
      role: user.role,
    };
  }

  async getAllUsers(): Promise<IUser[]> {
    return userRepository.findAll();
  }
}
