import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
@UseGuards(JwtAuthGuard) @Controller('materials')
export class MaterialsController {
  constructor(private service: MaterialsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('stocks') findStocks(@Query('groupId') groupId?: string) { return this.service.findStocks(groupId ? Number(groupId) : undefined); }
  @Get('summary') summary(@Query('groupId') groupId?: string) { return this.service.summary(groupId ? Number(groupId) : undefined); }
  @Post() create(@Body() dto: CreateMaterialDto) { return this.service.create(dto); }
  @Post('stocks') addStock(@Body() dto: CreateStockDto) { return this.service.addStock(dto); }
  @Put('stocks/:id') updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) { return this.service.updateStock(id, dto); }
}
