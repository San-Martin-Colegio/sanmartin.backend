import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { AreaMaterialStock } from '../materials/entities/area-material-stock.entity';
import { Computer } from '../computers/entities/computer.entity';
import { Category } from '../categories/entities/category.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(AreaMaterialStock)
    private readonly stockRepository: Repository<AreaMaterialStock>,
    @InjectRepository(Computer)
    private readonly computerRepository: Repository<Computer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find({
      order: { order: 'ASC', name: 'ASC' },
      relations: ['categories'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: number): Promise<{ message: string }> {
    const group = await this.findOne(id);
    if (await this.stockRepository.count({ where: { groupId: id } })) {
      throw new BadRequestException('No se puede eliminar el área: tiene existencias de materiales asociadas.');
    }
    if (await this.computerRepository.count({ where: { areaId: id } })) {
      throw new BadRequestException('No se puede eliminar el área: tiene laptops asociadas.');
    }
    const categoryIds = (group.categories || []).map((category) => category.id);
    if (categoryIds.length > 0) {
      await this.inventoryRepository.delete({ categoryId: In(categoryIds) });
      await this.categoryRepository.delete({ groupId: id });
    }
    await this.groupRepository.delete(id);
    return { message: 'Group deleted successfully' };
  }

  async count(): Promise<number> {
    return this.groupRepository.count();
  }
}
