import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity';

export enum PROVIDER {
  LOCAL = 'local',
  KAKAO = 'kakao',
  NAVER = 'naver',
}

export enum ROLE {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('tb_user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: ROLE.USER })
  role: ROLE;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true, select: false })
  password: string;

  @Column({ default: PROVIDER.LOCAL })
  provider: PROVIDER;

  @Column({ length: 255, nullable: true, select: false })
  providerId: string;

  @Column({ default: true })
  isActive: boolean;
}
