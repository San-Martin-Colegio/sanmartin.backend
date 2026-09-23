import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { AreaMaterialStock } from '../materials/entities/area-material-stock.entity';
import { Computer } from '../computers/entities/computer.entity';
import { Category } from '../categories/entities/category.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, AreaMaterialStock, Computer, Category, InventoryItem])],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
