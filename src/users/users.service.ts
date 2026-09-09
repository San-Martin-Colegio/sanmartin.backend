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
        this.logger.log('🌱 Sembrando usuario administrador por defecto (admin / admin1234)...');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('admin1234', salt);
        await this.userRepository.save(
          this.userRepository.create({
            username: 'admin',
            password: hash,
            fullName: 'Administrador General',
          }),
        );
        this.logger.log('✅ Usuario administrador creado con éxito (usuario: admin | clave: admin1234).');
      } else {
        const isValid = bcrypt.compareSync('admin1234', admin.password);
        if (!isValid) {
          this.logger.log('🔄 Sincronizando contraseña del usuario admin a admin1234...');
          const salt = bcrypt.genSaltSync(10);
          admin.password = bcrypt.hashSync('admin1234', salt);
          await this.userRepository.save(admin);
          this.logger.log('✅ Contraseña de admin actualizada a admin1234.');
        }
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
