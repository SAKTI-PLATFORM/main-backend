import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireRole } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthRoleEnum } from 'src/auth/enums/auth.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import { DashboardResponse } from './use-cases/get-dashboard/dashboard.response';
import { GetDashboardUseCase } from './use-cases/get-dashboard/get-dashboard.usecase';

@ApiTags('Seeker Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@RequireRole(AuthRoleEnum.JOB_SEEKER)
@Controller('seeker')
export class SeekerDashboardController {
  constructor(private readonly getDashboard: GetDashboardUseCase) {}

  @Get('dashboard')
  @HttpCode(200)
  @ApiOperation({ summary: 'Agregasi seluruh widget dashboard seeker (§12)' })
  @ApiResponse({ status: 200, type: DashboardResponse })
  async dashboard(
    @CurrentUser() user: ICurrentUser,
  ): Promise<DataResponse<DashboardResponse>> {
    const data = await this.getDashboard.execute(user.id);
    return new DataResponse(200, 'Dashboard berhasil diambil', data);
  }
}
