import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  getInfo() {
    return this.schoolService.getInfo();
  }

  @Put()
  updateInfo(@Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.updateInfo(updateSchoolDto);
  }
}
