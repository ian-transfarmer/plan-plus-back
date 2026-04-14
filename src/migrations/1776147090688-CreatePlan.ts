import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlan1776147090688 implements MigrationInterface {
    name = 'CreatePlan1776147090688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_plan" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "tb_plan" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "tb_plan" ADD "startTime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "tb_plan" ADD "endTime" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_plan" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "tb_plan" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "tb_plan" ADD "endDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "tb_plan" ADD "startDate" TIMESTAMP WITH TIME ZONE`);
    }

}
