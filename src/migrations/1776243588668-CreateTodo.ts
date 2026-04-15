import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTodo1776243588668 implements MigrationInterface {
  name = 'CreateTodo1776243588668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tb_todo" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'TODO', CONSTRAINT "PK_7f6a01685c9b03c45916c067693" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tb_todo"`);
  }
}
