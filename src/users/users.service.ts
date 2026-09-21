import { Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    try {
      const admin = await this.findByUsername('admin');
      if (!admin) {
        const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
        if (!initialPassword) {
          this.logger.warn('No existe el usuario admin. Configura ADMIN_INITIAL_PASSWORD para crearlo.');
          return;
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(initialPassword, salt);
        await this.userRepository.save(
          this.userRepository.create({
            username: 'admin',
            password: hash,
            fullName: 'Administrador General',
          }),
        );
        this.logger.log('Usuario administrador inicial creado.');
      }
    } catch (err) {
      this.logger.warn(`Nota: No se pudo auto-sembrar admin en el arranque (${err.message}). Se sembrará al conectar la BD.`);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }
}
