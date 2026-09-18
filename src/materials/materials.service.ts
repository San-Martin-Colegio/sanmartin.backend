import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { AreaMaterialStock } from './entities/area-material-stock.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class MaterialsService {
  constructor(@InjectRepository(Material) private materials: Repository<Material>, @InjectRepository(AreaMaterialStock) private stocks: Repository<AreaMaterialStock>) {}
  findAll() { return this.materials.find({ order: { name: 'ASC' } }); }
  async create(dto: CreateMaterialDto) { const name = dto.name.trim(); if (!name) throw new BadRequestException('El nombre del material es obligatorio.'); const exists = await this.materials.createQueryBuilder('material').where('LOWER(material.name) = LOWER(:name)', { name }).getOne(); if (exists) return exists; return this.materials.save(this.materials.create({ name })); }
  findStocks(groupId?: number) { return this.stocks.find({ where: groupId ? { groupId } : {}, relations: ['group', 'material'], order: { createdAt: 'DESC' } }); }
  async addStock(dto: CreateStockDto) { const existing = await this.stocks.findOne({ where: { groupId: dto.groupId, materialId: dto.materialId }, relations: ['group', 'material'] }); if (existing) { existing.quantity += dto.quantity; await this.stocks.save(existing); return this.stocks.findOne({ where: { id: existing.id }, relations: ['group', 'material'] }); } const stock = await this.stocks.save(this.stocks.create(dto)); return this.stocks.findOne({ where: { id: stock.id }, relations: ['group', 'material'] }); }
  async updateStock(id: number, dto: UpdateStockDto) { const stock = await this.stocks.findOne({ where: { id } }); if (!stock) throw new NotFoundException('Existencia no encontrada.'); stock.quantity = dto.quantity; await this.stocks.save(stock); return this.stocks.findOne({ where: { id }, relations: ['group', 'material'] }); }
  async summary(groupId?: number) { const rows = await this.stocks.createQueryBuilder('stock').innerJoinAndSelect('stock.material', 'material').where(groupId ? 'stock.groupId = :groupId' : '1 = 1', { groupId }).select('material.id', 'id').addSelect('material.name', 'name').addSelect('COALESCE(SUM(stock.quantity), 0)', 'quantity').groupBy('material.id').addGroupBy('material.name').having('SUM(stock.quantity) > 0').orderBy('material.name', 'ASC').getRawMany(); return rows.map((row) => ({ id: Number(row.id), name: row.name, quantity: Number(row.quantity) })); }
}
