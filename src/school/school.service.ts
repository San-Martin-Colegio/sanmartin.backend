import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async getInfo(): Promise<School> {
    let school = await this.schoolRepository.findOne({ where: { id: 1 } });
    if (!school) {
      school = this.schoolRepository.create({
        id: 1,
        name: 'Colegio San Martín de Porres',
        address: 'Av. Principal 123',
        phone: '999888777',
        email: 'contacto@smp.edu.pe',
        principal: 'Dr. Roberto Gómez',
        mission: 'Formar líderes con valores y excelencia académica.',
        vision: 'Ser la institución educativa líder reconocida por su calidad.',
        values: 'Responsabilidad, Respeto, Honestidad, Solidaridad',
      });
      await this.schoolRepository.save(school);
    }
    return school;
  }

  async updateInfo(updateDto: UpdateSchoolDto): Promise<School> {
    const school = await this.getInfo();
    Object.assign(school, updateDto);
    return this.schoolRepository.save(school);
  }
}
