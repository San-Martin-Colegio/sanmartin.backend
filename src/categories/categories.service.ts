import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(groupId?: number): Promise<Category[]> {
    const whereClause = groupId ? { groupId } : {};
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.group', 'group')
      .leftJoin('category.inventoryItems', 'item')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'itemCount')
      .where(groupId ? 'category.groupId = :groupId' : '1 = 1', { groupId })
      .groupBy('category.id')
      .addGroupBy('group.id')
      .orderBy('category.name', 'ASC')
      .getRawAndEntities();

    return result.entities.map((category, index) => ({
      ...category,
      itemCount: Number(result.raw[index]?.itemCount ?? 0),
    }));
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['group', 'inventoryItems'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    if (category.inventoryItems && category.inventoryItems.length > 0) {
      throw new BadRequestException('Cannot delete category containing inventory items');
    }
    await this.categoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }

  async count(): Promise<number> {
    return this.categoryRepository.count();
  }
}
