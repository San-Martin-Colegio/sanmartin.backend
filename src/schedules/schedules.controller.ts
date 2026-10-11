import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { FilterSchedulesDto } from './dto/filter-schedules.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('export-all')
  exportAll(@Res() res: Response) {
    return this.schedulesService.exportAll(res);
  }

  @Get('export/:teacherId')
  exportTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Res() res: Response,
  ) {
    return this.schedulesService.exportTeacher(teacherId, res);
  }

  @Get()
  findAll(@Query() query: FilterSchedulesDto) {
    return this.schedulesService.findAll(query.teacherId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateScheduleDto) {
    return this.schedulesService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
