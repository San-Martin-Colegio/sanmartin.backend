import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { AreaMaterialStock } from './entities/area-material-stock.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
@Module({ imports: [TypeOrmModule.forFeature([Material, AreaMaterialStock])], providers: [MaterialsService], controllers: [MaterialsController] }) export class MaterialsModule {}
