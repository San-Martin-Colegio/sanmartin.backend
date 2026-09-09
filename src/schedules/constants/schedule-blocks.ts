export interface ScheduleBlockInfo {
  block: number;
  startTime: string;
  endTime: string;
}

export const SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '07:00', endTime: '07:45' },
  { block: 2, startTime: '07:45', endTime: '08:30' },
  { block: 3, startTime: '08:30', endTime: '09:15' },
  { block: 4, startTime: '09:30', endTime: '10:15' },
  { block: 5, startTime: '10:15', endTime: '11:00' },
  { block: 6, startTime: '11:00', endTime: '11:45' },
  { block: 7, startTime: '11:45', endTime: '12:30' },
  { block: 8, startTime: '13:00', endTime: '13:45' },
  { block: 9, startTime: '13:45', endTime: '14:30' },
];

export const SCHEDULE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
