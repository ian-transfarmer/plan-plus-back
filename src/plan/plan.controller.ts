import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GetPlansDto } from './dto/get-plans.dto';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async createPlan(@Req() req, @Body() dto: CreatePlanDto) {
    return await this.planService.createPlan(req.user.sub, dto);
  }

  @Get()
  async getPlans(@Req() req, @Query() query: GetPlansDto) {
    return await this.planService.getPlans(
      req.user.sub,
      query.startDate,
      query.endDate,
    );
  }
}
