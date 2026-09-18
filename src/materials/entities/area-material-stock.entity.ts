import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Material } from './material.entity';

@Entity('area_material_stocks')
@Unique(['groupId', 'materialId'])
export class AreaMaterialStock {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'group_id' }) groupId: number;
  @Column({ name: 'material_id' }) materialId: number;
  @Column({ type: 'int', default: 0 }) quantity: number;
  @ManyToOne(() => Group, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'group_id' }) group: Group;
  @ManyToOne(() => Material, (material) => material.stocks, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'material_id' }) material: Material;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
