import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1776147994403 implements MigrationInterface {
    name = 'CreateTable1776147994403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_user" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL DEFAULT 'user', "name" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255), "provider" character varying NOT NULL DEFAULT 'local', "providerId" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'active', CONSTRAINT "PK_1943338f8f00e074a3c5bb48d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_plan" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying(100) NOT NULL, "description" text, "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5725249555ee1bd3a5d666243a6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tb_plan"`);
        await queryRunner.query(`DROP TABLE "tb_user"`);
    }

}
