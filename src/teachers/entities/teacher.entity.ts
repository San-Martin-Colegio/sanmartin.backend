import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { encryptedTextTransformer } from '../../common/transformers/encrypted-text.transformer';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedTextTransformer })
  phone: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedTextTransformer })
  email: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedTextTransformer })
  address: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ name: 'education_level', default: 'Secundaria' })
  educationLevel: string;

  @Column({ default: 'Activo' })
  status: string; // 'Activo' | 'Inactivo'

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  schedules: Schedule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
