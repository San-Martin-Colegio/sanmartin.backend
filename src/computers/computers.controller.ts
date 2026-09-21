import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComputersService } from './computers.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
@UseGuards(JwtAuthGuard) @Controller('computers')
export class ComputersController {
  constructor(private readonly service: ComputersService) {}
  @Get() findAll(@Query('status') status?: string, @Query('q') q?: string) { return this.service.findAll(status, q); }
  @Post() create(@Body() dto: CreateComputerDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateComputerDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
