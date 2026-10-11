import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { FilterStocksDto } from './dto/filter-stocks.dto';
@UseGuards(JwtAuthGuard) @Controller('materials')
export class MaterialsController {
  constructor(private service: MaterialsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('stocks') findStocks(@Query() query: FilterStocksDto) { return this.service.findStocks(query.groupId); }
  @Get('summary') summary(@Query() query: FilterStocksDto) { return this.service.summary(query.groupId); }
  @Post() create(@Body() dto: CreateMaterialDto) { return this.service.create(dto); }
  @Post('stocks') addStock(@Body() dto: CreateStockDto) { return this.service.addStock(dto); }
  @Put('stocks/:id') updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) { return this.service.updateStock(id, dto); }
  @Delete('stocks/:id') removeStock(@Param('id', ParseIntPipe) id: number) { return this.service.removeStock(id); }
}
