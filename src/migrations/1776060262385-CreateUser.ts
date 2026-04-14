import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1776060262385 implements MigrationInterface {
  name = 'CreateUser1776060262385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tb_user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL DEFAULT 'user', "name" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255), "provider" character varying NOT NULL DEFAULT 'local', "providerId" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'active', CONSTRAINT "PK_1943338f8f00e074a3c5bb48d5e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tb_user"`);
  }
}
