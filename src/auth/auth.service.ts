import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface AccessTokenPayload {
  access_token: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user || !user.passwordHash) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    const { passwordHash: _, ...result } = user;
    return result as User;
  }

  async login(loginDto: LoginDto): Promise<AccessTokenPayload> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou password incorretos');
    }
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<AccessTokenPayload> {
    try {
      const user = await this.usersService.create(createUserDto);
      const payload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);
      return {
        access_token,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw err;
    }
  }
}
