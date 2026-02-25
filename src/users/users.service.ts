import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Já existe um utilizador com este email');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const { password: _, ...rest } = createUserDto;
    const user = this.userRepo.create({
      ...rest,
      passwordHash,
      role: createUserDto.role ?? UserRole.CLIENTE,
    });
    return this.userRepo.save(user);
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
    if (includePassword) {
      qb.addSelect('user.passwordHash');
    }
    return qb.getOne();
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException('Já existe um utilizador com este email');
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      (updateUserDto as any).passwordHash = await bcrypt.hash(
        updateUserDto.password,
        salt,
      );
      delete updateUserDto.password;
    }

    await this.userRepo.update(id, updateUserDto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.userRepo.softDelete(id);
  }
}
