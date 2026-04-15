import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';
import { User } from '../../user/entity/user.entity';

export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity('tb_todo')
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  content: string;

  @Column({ length: 20, default: TodoStatus.TODO })
  status: TodoStatus;

  @ManyToOne(() => User, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
