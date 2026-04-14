import { Body, Controller, Post, Req } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async createPlan(@Req() req, @Body() dto: CreatePlanDto) {
    return await this.planService.createPlan(req.user.sub, dto);
  }
}
