import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireRole } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthRoleEnum } from 'src/auth/enums/auth.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import type {
  MatchResult,
  RoleOption,
  SkillGapResult,
} from 'src/domain/types/career.type';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import { SeekerCareerService } from './seeker-career.service';

@ApiTags('Seeker Career')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@RequireRole(AuthRoleEnum.JOB_SEEKER)
@Controller('seeker')
export class SeekerCareerController {
  constructor(private readonly career: SeekerCareerService) {}

  @Get('roles')
  @HttpCode(200)
  @ApiOperation({ summary: 'Daftar target role untuk picker onboarding' })
  async roles(): Promise<DataResponse<RoleOption[]>> {
    const data = await this.career.listRoles();
    return new DataResponse(200, 'Roles berhasil diambil', data);
  }

  @Get('matches')
  @HttpCode(200)
  @ApiOperation({ summary: 'Lowongan ter-rank untuk seeker (Matchmaker RAG-A §11)' })
  async matches(
    @CurrentUser() user: ICurrentUser,
  ): Promise<DataResponse<MatchResult[]>> {
    const data = await this.career.getMatches(user.id);
    return new DataResponse(200, 'Matches berhasil diambil', data);
  }

  @Get('skill-gaps')
  @HttpCode(200)
  @ApiOperation({ summary: 'Skill gap prioritas (TalentForge §11)' })
  async skillGaps(
    @CurrentUser() user: ICurrentUser,
  ): Promise<DataResponse<SkillGapResult | null>> {
    const data = await this.career.getSkillGaps(user.id);
    return new DataResponse(200, 'Skill gap berhasil diambil', data);
  }
}
