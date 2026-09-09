import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Schedule } from './entities/schedule.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { School } from '../school/entities/school.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SCHEDULE_BLOCKS, SCHEDULE_DAYS } from './constants/schedule-blocks';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async findAll(teacherId?: number): Promise<Schedule[]> {
    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.teacher', 'teacher')
      .orderBy('teacher.lastName', 'ASC')
      .addOrderBy('schedule.day', 'ASC')
      .addOrderBy('schedule.block', 'ASC');

    if (teacherId) {
      qb.where('schedule.teacherId = :teacherId', { teacherId });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule entry with ID ${id} not found`);
    }
    return schedule;
  }

  async create(createDto: CreateScheduleDto): Promise<Schedule> {
    const blockInfo = SCHEDULE_BLOCKS.find((b) => b.block === createDto.block);
    if (!blockInfo) {
      throw new BadRequestException('Invalid schedule block');
    }

    // Check teacher existence
    const teacher = await this.teacherRepository.findOne({
      where: { id: createDto.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createDto.teacherId} not found`);
    }

    // Conflict check: same teacher, same day, same block
    const conflict = await this.scheduleRepository.findOne({
      where: {
        teacherId: createDto.teacherId,
        day: createDto.day,
        block: createDto.block,
      },
    });
    if (conflict) {
      throw new ConflictException(
        'Conflicto: El docente ya tiene una clase asignada en este bloque y día.',
      );
    }

    const schedule = this.scheduleRepository.create({
      ...createDto,
      startTime: blockInfo.startTime,
      endTime: blockInfo.endTime,
    });

    const saved = await this.scheduleRepository.save(schedule);
    return this.findOne(saved.id);
  }

  async update(id: number, updateDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);

    const targetDay = updateDto.day !== undefined ? updateDto.day : schedule.day;
    const targetBlock = updateDto.block !== undefined ? updateDto.block : schedule.block;

    const blockInfo = SCHEDULE_BLOCKS.find((b) => b.block === targetBlock);
    if (!blockInfo) {
      throw new BadRequestException('Invalid schedule block');
    }

    // Check conflict excluding current record
    const conflict = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.teacherId = :teacherId', { teacherId: schedule.teacherId })
      .andWhere('schedule.day = :day', { day: targetDay })
      .andWhere('schedule.block = :block', { block: targetBlock })
      .andWhere('schedule.id != :id', { id })
      .getOne();

    if (conflict) {
      throw new ConflictException(
        'Conflicto: El docente ya tiene una clase asignada en este bloque y día.',
      );
    }

    Object.assign(schedule, {
      ...updateDto,
      startTime: blockInfo.startTime,
      endTime: blockInfo.endTime,
    });

    await this.scheduleRepository.save(schedule);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.scheduleRepository.delete(id);
    return { message: 'Schedule entry deleted successfully' };
  }

  private generateWeeklySheet(
    sheet: ExcelJS.Worksheet,
    teacher: Teacher,
    schedules: Schedule[],
    schoolName: string,
  ) {
    sheet.columns = [
      { key: 'bloque', width: 10 },
      { key: 'hora', width: 18 },
      { key: 'lunes', width: 22 },
      { key: 'martes', width: 22 },
      { key: 'miercoles', width: 22 },
      { key: 'jueves', width: 22 },
      { key: 'viernes', width: 22 },
    ];

    sheet.mergeCells('A1:G1');
    const r1 = sheet.getCell('A1');
    r1.value = schoolName || 'Colegio San Martín de Porres';
    r1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
    r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    r1.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('A2:G2');
    const r2 = sheet.getCell('A2');
    r2.value = `Horario de: ${teacher.firstName} ${teacher.lastName}`;
    r2.font = { bold: true, size: 14 };
    r2.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Bloque',
      'Hora',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    SCHEDULE_BLOCKS.forEach((block) => {
      if (block.block === 4) {
        const recessRow = sheet.addRow(['', '', '', '', '', '', '']);
        sheet.mergeCells(`A${recessRow.number}:G${recessRow.number}`);
        const c = sheet.getCell(`A${recessRow.number}`);
        c.value = 'RECREO (09:15 - 09:30)';
        c.font = { bold: true, color: { argb: 'FF374151' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      const rowValues = [
        `B${block.block}`,
        `${block.startTime} - ${block.endTime}`,
      ];

      SCHEDULE_DAYS.forEach((day) => {
        const item = schedules.find((s) => s.day === day && s.block === block.block);
        if (item) {
          const detail = [
            item.subject || '',
            item.gradeSection ? `(${item.gradeSection})` : '',
            item.classroom ? `[${item.classroom}]` : '',
          ]
            .filter(Boolean)
            .join(' ');
          rowValues.push(detail);
        } else {
          rowValues.push('-');
        }
      });

      const row = sheet.addRow(rowValues);
      row.eachCell((cell, colNum) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (colNum <= 2) {
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
      });
    });
  }

  async exportTeacher(teacherId: number, res: Response): Promise<void> {
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    const schedules = await this.scheduleRepository.find({
      where: { teacherId },
      order: { day: 'ASC', block: 'ASC' },
    });

    const school = (await this.schoolRepository.findOne({ where: { id: 1 } })) || {
      name: 'Colegio San Martín de Porres',
    };

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Datos del Docente
    const sheet1 = workbook.addWorksheet('Datos del Docente');
    sheet1.columns = [{ width: 18 }, { width: 45 }];

    sheet1.mergeCells('A1:B1');
    const titleCell = sheet1.getCell('A1');
    titleCell.value = school.name || 'Colegio San Martín de Porres';
    titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet1.mergeCells('A2:B2');
    const subCell = sheet1.getCell('A2');
    subCell.value = 'Ficha del Docente';
    subCell.font = { bold: true, size: 14 };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const teacherData = [
      ['Nombres:', teacher.firstName],
      ['Apellidos:', teacher.lastName],
      ['Celular:', teacher.phone || ''],
      ['Correo:', teacher.email || ''],
      ['Dirección:', teacher.address || ''],
      ['Especialidad:', teacher.specialty || ''],
      ['Estado:', teacher.status || 'Activo'],
    ];

    teacherData.forEach((d) => {
      const row = sheet1.addRow(d);
      const labelCell = row.getCell(1);
      labelCell.font = { bold: true };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4A843' } };
    });

    // Sheet 2: Horario Semanal
    const sheet2 = workbook.addWorksheet('Horario Semanal');
    this.generateWeeklySheet(sheet2, teacher, schedules, school.name);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=horario_${teacher.lastName}_${teacher.firstName}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportAll(res: Response): Promise<void> {
    const teachers = await this.teacherRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    const school = (await this.schoolRepository.findOne({ where: { id: 1 } })) || {
      name: 'Colegio San Martín de Porres',
    };

    const workbook = new ExcelJS.Workbook();

    for (const teacher of teachers) {
      const schedules = await this.scheduleRepository.find({
        where: { teacherId: teacher.id },
        order: { day: 'ASC', block: 'ASC' },
      });

      const sheetName = `${teacher.lastName} ${teacher.firstName}`.substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      this.generateWeeklySheet(sheet, teacher, schedules, school.name);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=todos_los_horarios.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
