import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1776145054591 implements MigrationInterface {
  name = 'CreateUser1776145054591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
