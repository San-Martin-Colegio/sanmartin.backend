import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { FilterInventoryDto } from './dto/filter-inventory.dto';
import { Group } from '../groups/entities/group.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async findAll(filter: FilterInventoryDto) {
    const qb = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('category.group', 'group')
      .orderBy('item.createdAt', 'DESC');

    if (filter.q) {
      qb.andWhere(
        '(LOWER(item.name) LIKE LOWER(:q) OR LOWER(item.location) LIKE LOWER(:q) OR LOWER(item.notes) LIKE LOWER(:q))',
        { q: `%${filter.q}%` },
      );
    }

    if (filter.categoryId) {
      qb.andWhere('item.categoryId = :categoryId', {
        categoryId: parseInt(filter.categoryId, 10),
      });
    }

    if (filter.groupId) {
      qb.andWhere('category.groupId = :groupId', {
        groupId: parseInt(filter.groupId, 10),
      });
    }

    if (filter.status) {
      qb.andWhere('item.status = :status', { status: filter.status });
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['category', 'category.group'],
    });
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return item;
  }

  async create(createDto: CreateInventoryDto) {
    const item = this.inventoryRepository.create(createDto);
    const saved = await this.inventoryRepository.save(item);
    return this.findOne(saved.id);
  }

  async update(id: number, updateDto: UpdateInventoryDto) {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    await this.inventoryRepository.save(item);
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.inventoryRepository.delete(item.id);
    return { message: 'Item deleted successfully' };
  }

  async getStats() {
    // 1. Total items count & sum of quantities
    const totalResult = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.quantity), 0)', 'total')
      .getRawOne();
    const total = totalResult ? parseInt(totalResult.total, 10) : 0;

    // 2. Status counts
    const statusRows = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('item.status', 'status')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'count')
      .groupBy('item.status')
      .getRawMany();

    const byStatus = { Bueno: 0, Regular: 0, Malo: 0 };
    statusRows.forEach((row) => {
      if (row.status && byStatus.hasOwnProperty(row.status)) {
        byStatus[row.status] = parseInt(row.count, 10);
      }
    });

    // 3. By Group
    const groups = await this.groupRepository.find();
    const groupRows = await this.inventoryRepository
      .createQueryBuilder('item')
      .innerJoin('item.category', 'category')
      .select('category.groupId', 'groupId')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'count')
      .groupBy('category.groupId')
      .getRawMany();

    const byGroup: Record<number, number> = {};
    groups.forEach((g) => {
      byGroup[g.id] = 0;
    });
    groupRows.forEach((r) => {
      const gId = parseInt(r.groupId, 10);
      byGroup[gId] = parseInt(r.count, 10);
    });

    // 4. Recent 5 items
    const recent = await this.inventoryRepository.find({
      relations: ['category', 'category.group'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 5. Items needing attention (status = Malo)
    const attention = await this.inventoryRepository.find({
      where: { status: 'Malo' },
      relations: ['category', 'category.group'],
      order: { createdAt: 'DESC' },
    });

    return {
      total,
      byStatus,
      byGroup,
      recent,
      attention,
    };
  }
}
