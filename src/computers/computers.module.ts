import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computer } from './entities/computer.entity';
import { ComputersService } from './computers.service';
import { ComputersController } from './computers.controller';
@Module({ imports: [TypeOrmModule.forFeature([Computer])], providers: [ComputersService], controllers: [ComputersController] }) export class ComputersModule {}
