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
}
