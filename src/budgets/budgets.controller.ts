import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Request } from 'express';
import { Budget } from './entities/budget.entity';
import { IPayloadToken } from 'src/common/interfaces/payload-token.interface';
import { FilterBudgetDto } from './dto/filter-budget.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { IBudgetBalance } from './interfaces/balance.interface';

@UseGuards(JwtAuthGuard)
@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOkResponse({
    description: 'Budget created successfully.',
    type: Budget,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error: The budget could not be created.',
  })
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @Req() req: Request,
  ): Promise<Budget> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.create(user.sub, createBudgetDto);
  }

  @Get()
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter budgets by category name.',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Filter budgets by month 0 - 11(0 = January, 11 = December).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter budgets by their status.(pending, active, completed)',
  })
  @ApiOkResponse({
    description: 'Budgets retrieved successfully.',
    type: [Budget],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async findAll(
    @Req() req: Request,
    @Query() filterOptions: FilterBudgetDto,
  ): Promise<Budget[]> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.findAll(user.sub, filterOptions);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the budget (UUID).',
    required: true,
    example: 'b2c6e182-6aef-4c38-8d26-9153d7ebc7d2',
  })
  @ApiOkResponse({
    description: 'Budget retrieved successfully.',
    type: Budget,
  })
  @ApiNotFoundResponse({ description: 'Budget not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Budget> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the budget (UUID).',
    required: true,
  })
  @ApiOkResponse({
    description: 'Budget updated successfully.',
    type: Budget,
  })
  @ApiNotFoundResponse({
    description: 'Budget not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error: The budget could not be updated.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Req() req: Request,
  ): Promise<Budget> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.update(id, user.sub, updateBudgetDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the budget (UUID).',
    required: true,
  })
  @ApiOkResponse({
    description: 'Budget deleted successfully.',
    schema: {
      example: {
        message: 'Budget deleted successfully',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error: The budget could not be deleted',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<{
    message: string;
  }> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.remove(id, user.sub);
  }

  @Get(':id/balance')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the budget (UUID).',
    required: true,
    example: 'b2c6e182-6aef-4c38-8d26-9153d7ebc7d2',
  })
  @ApiOkResponse({
    description: 'Budget balance retrieved successfully.',
    schema: {
      example: {
        initial_amount: 1000,
        spent_amount: 200,
        percentage_spent_amount: 20.0,
        remaining_amount: 800,
        percentage_remaining_amount: 80.0,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Budget to calculate the balance not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error: Unable to retrieve the budget balance.',
  })
  async getBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<IBudgetBalance> {
    const user = req.user as IPayloadToken;
    return await this.budgetsService.getBalance(id, user.sub);
  }
}
