import { Exclude } from 'class-transformer';
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

export enum USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('tb_user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, default: ROLE.USER })
  role: ROLE;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Exclude()
  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ length: 20, default: PROVIDER.LOCAL })
  provider: PROVIDER;

  @Exclude()
  @Column({ length: 255, nullable: true })
  providerId: string;

  @Column({ length: 20, default: USER_STATUS.ACTIVE })
  status: USER_STATUS;
}
