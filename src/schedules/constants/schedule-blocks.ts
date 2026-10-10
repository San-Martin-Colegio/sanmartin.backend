export interface ScheduleBlockInfo {
  block: number;
  startTime: string;
  endTime: string;
}

export type ScheduleMarkerType = 'shift' | 'recess' | 'lunch';

export interface ScheduleMarkerInfo {
  beforeBlock: number;
  label: string;
  type: ScheduleMarkerType;
}

export interface ScheduleLayout {
  blocks: ScheduleBlockInfo[];
  markers: ScheduleMarkerInfo[];
}

export const SECONDARY_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
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

export const PRIMARY_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '07:30', endTime: '08:15' },
  { block: 2, startTime: '08:15', endTime: '09:00' },
  { block: 3, startTime: '09:00', endTime: '09:45' },
  { block: 4, startTime: '10:15', endTime: '11:00' },
  { block: 5, startTime: '11:00', endTime: '11:45' },
  { block: 6, startTime: '11:45', endTime: '12:30' },
  { block: 7, startTime: '13:00', endTime: '13:45' },
  { block: 8, startTime: '13:45', endTime: '14:30' },
  { block: 9, startTime: '14:30', endTime: '15:15' },
  { block: 10, startTime: '15:30', endTime: '16:15' },
  { block: 11, startTime: '16:15', endTime: '17:00' },
  { block: 12, startTime: '17:00', endTime: '17:45' },
];

export const INITIAL_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '08:00', endTime: '08:45' },
  { block: 2, startTime: '08:45', endTime: '09:30' },
  { block: 3, startTime: '09:45', endTime: '10:30' },
  { block: 4, startTime: '10:30', endTime: '11:15' },
  { block: 5, startTime: '11:15', endTime: '12:00' },
  { block: 6, startTime: '13:00', endTime: '13:45' },
  { block: 7, startTime: '13:45', endTime: '14:30' },
  { block: 8, startTime: '14:45', endTime: '15:30' },
  { block: 9, startTime: '15:30', endTime: '16:15' },
  { block: 10, startTime: '16:15', endTime: '17:00' },
];

export const ADMINISTRATIVE_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '07:00', endTime: '14:45' },
  { block: 2, startTime: '07:00', endTime: '15:00' },
  { block: 3, startTime: '11:00', endTime: '19:00' },
  { block: 4, startTime: '12:00', endTime: '20:00' },
  { block: 5, startTime: '15:00', endTime: '23:00' },
];

export const DIRECTIVE_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '07:00', endTime: '15:00' },
  { block: 2, startTime: '10:00', endTime: '18:00' },
];

export const AUXILIARY_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = [
  { block: 1, startTime: '07:00', endTime: '13:00' },
  { block: 2, startTime: '08:30', endTime: '14:30' },
  { block: 3, startTime: '08:45', endTime: '14:45' },
];

export const SECURITY_SCHEDULE_BLOCKS: ScheduleBlockInfo[] = Array.from(
  { length: 24 },
  (_, index) => ({
    block: index + 1,
    startTime: `${String(index).padStart(2, '0')}:00`,
    endTime: `${String(index + 1).padStart(2, '0')}:00`,
  }),
);

const SECONDARY_LAYOUT: ScheduleLayout = {
  blocks: SECONDARY_SCHEDULE_BLOCKS,
  markers: [
    { beforeBlock: 4, label: 'RECREO (09:15 - 09:30)', type: 'recess' },
    { beforeBlock: 8, label: 'ALMUERZO (12:30 - 13:00)', type: 'lunch' },
  ],
};

const PRIMARY_LAYOUT: ScheduleLayout = {
  blocks: PRIMARY_SCHEDULE_BLOCKS,
  markers: [
    { beforeBlock: 1, label: 'TURNO MAÑANA (07:30 - 12:30)', type: 'shift' },
    { beforeBlock: 4, label: 'RECREO MAÑANA (09:45 - 10:15)', type: 'recess' },
    { beforeBlock: 7, label: 'ALMUERZO / CAMBIO DE TURNO (12:30 - 13:00)', type: 'lunch' },
    { beforeBlock: 7, label: 'TURNO TARDE (13:00 - 17:45)', type: 'shift' },
    { beforeBlock: 10, label: 'RECREO TARDE (15:15 - 15:30)', type: 'recess' },
  ],
};

const INITIAL_LAYOUT: ScheduleLayout = {
  blocks: INITIAL_SCHEDULE_BLOCKS,
  markers: [
    { beforeBlock: 1, label: 'TURNO MAÑANA (08:00 - 12:00)', type: 'shift' },
    { beforeBlock: 3, label: 'RECREO MAÑANA (09:30 - 09:45)', type: 'recess' },
    { beforeBlock: 6, label: 'ALMUERZO / CAMBIO DE TURNO (12:00 - 13:00)', type: 'lunch' },
    { beforeBlock: 6, label: 'TURNO TARDE (13:00 - 17:00)', type: 'shift' },
    { beforeBlock: 8, label: 'RECREO TARDE (14:30 - 14:45)', type: 'recess' },
  ],
};

const ADMINISTRATIVE_LAYOUT: ScheduleLayout = {
  blocks: ADMINISTRATIVE_SCHEDULE_BLOCKS,
  markers: [
    { beforeBlock: 1, label: 'TURNOS DEL PERSONAL ADMINISTRATIVO', type: 'shift' },
  ],
};

const DIRECTIVE_LAYOUT: ScheduleLayout = {
  blocks: DIRECTIVE_SCHEDULE_BLOCKS,
  markers: [{ beforeBlock: 1, label: 'TURNOS DEL PERSONAL DIRECTIVO', type: 'shift' }],
};

const AUXILIARY_LAYOUT: ScheduleLayout = {
  blocks: AUXILIARY_SCHEDULE_BLOCKS,
  markers: [{ beforeBlock: 1, label: 'TURNOS DEL PERSONAL AUXILIAR', type: 'shift' }],
};

const SECURITY_LAYOUT: ScheduleLayout = {
  blocks: SECURITY_SCHEDULE_BLOCKS,
  markers: [{ beforeBlock: 1, label: 'COBERTURA DE VIGILANCIA: 24 HORAS', type: 'shift' }],
};

export function getScheduleLayout(educationLevel?: string): ScheduleLayout {
  if (educationLevel === 'Inicial') return INITIAL_LAYOUT;
  if (educationLevel === 'Primaria') return PRIMARY_LAYOUT;
  if (educationLevel === 'Administrativo') return ADMINISTRATIVE_LAYOUT;
  if (educationLevel === 'Directivo') return DIRECTIVE_LAYOUT;
  if (educationLevel === 'Auxiliares') return AUXILIARY_LAYOUT;
  if (educationLevel === 'Vigilantes') return SECURITY_LAYOUT;
  return SECONDARY_LAYOUT;
}

export function getScheduleBlock(
  educationLevel: string | undefined,
  block: number,
): ScheduleBlockInfo | undefined {
  return getScheduleLayout(educationLevel).blocks.find((item) => item.block === block);
}

// Compatibilidad con migraciones antiguas: el esquema histórico corresponde a Secundaria.
export const SCHEDULE_BLOCKS = SECONDARY_SCHEDULE_BLOCKS;

export const SCHEDULE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
