import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Computer } from './entities/computer.entity';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';

@Injectable()
export class ComputersService {
  constructor(@InjectRepository(Computer) private readonly computers: Repository<Computer>) {}
  async findAll(status?: string, q?: string) {
    const query = this.computers.createQueryBuilder('computer').leftJoinAndSelect('computer.area', 'area');
    if (status) query.andWhere('computer.status = :status', { status });
    if (q) query.andWhere('(CAST(computer.id AS TEXT) ILIKE :q OR computer.code ILIKE :q OR computer.observation ILIKE :q)', { q: `%${q}%` });
    const computers = await query.getMany();
    const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
    return computers.sort((a, b) => collator.compare(a.code, b.code) || a.id - b.id);
  }
  async findOne(id: number) { const computer = await this.computers.findOne({ where: { id }, relations: ['area'] }); if (!computer) throw new NotFoundException('Computadora no encontrada.'); return computer; }
  async create(dto: CreateComputerDto) { const saved = await this.computers.save(this.computers.create({ ...dto, code: dto.code.trim() })); return this.findOne(saved.id); }
  async update(id: number, dto: UpdateComputerDto) {
    await this.findOne(id);
    const update: Partial<Computer> = { ...dto };
    if (dto.areaId !== undefined) update.areaId = Number(dto.areaId);
    if (dto.code !== undefined) update.code = dto.code.trim();
    await this.computers.update(id, update);
    return this.findOne(id);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.computers.delete(id);
    return { message: 'Computadora eliminada correctamente.' };
  }
}
