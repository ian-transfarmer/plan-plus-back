import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1776149109880 implements MigrationInterface {
  name = 'UpdateUser1776149109880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "role"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "role" character varying(20) NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "provider"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "provider" character varying(20) NOT NULL DEFAULT 'local'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "provider"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "provider" character varying NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "role"`);
    await queryRunner.query(
      `ALTER TABLE "tb_user" ADD "role" character varying NOT NULL DEFAULT 'user'`,
    );
  }
}
