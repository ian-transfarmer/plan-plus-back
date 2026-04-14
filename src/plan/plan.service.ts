import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entity/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async createPlan(userId: string, dto: Partial<Plan>) {
    const plan = this.planRepository.create({ ...dto, userId });
    return await this.planRepository.save(plan);
  }

  async getPlans(userId: string, startDate: string, endDate: string) {
    return await this.planRepository
      .createQueryBuilder('plan')
      .where('plan.userId = :userId', { userId })
      .andWhere('CAST(plan.startTime AS date) >= :startDate', { startDate })
      .andWhere('CAST(plan.startTime AS date) <= :endDate', { endDate })
      .getMany();
  }
}
