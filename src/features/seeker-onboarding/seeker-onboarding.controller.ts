import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRole } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthRoleEnum } from 'src/auth/enums/auth.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { DataResponse } from 'src/infrastructure/core/http/http-response';
import {
  OnboardingStepResult,
  SubmitAssessmentDto,
  SubmitAssessmentUseCase,
  SubmitExpertiseDto,
  SubmitExpertiseUseCase,
  SubmitFoundationDto,
  SubmitFoundationUseCase,
  SubmitVisionDto,
  SubmitVisionUseCase,
} from './use-cases';

@ApiTags('Seeker Onboarding')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@RequireRole(AuthRoleEnum.JOB_SEEKER)
@Controller('seeker/onboarding')
export class SeekerOnboardingController {
  constructor(
    private readonly submitFoundation: SubmitFoundationUseCase,
    private readonly submitExpertise: SubmitExpertiseUseCase,
    private readonly submitAssessment: SubmitAssessmentUseCase,
    private readonly submitVision: SubmitVisionUseCase,
  ) {}

  @Post('foundation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 01 — The Foundation (profil dasar)' })
  @ApiResponse({ status: 200, type: OnboardingStepResult })
  async foundation(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: SubmitFoundationDto,
  ): Promise<DataResponse<OnboardingStepResult>> {
    const result = await this.submitFoundation.execute(user.id, dto);
    return new DataResponse(200, 'Step Foundation tersimpan', result);
  }

  @Post('expertise')
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 02 — Your Expertise (skill self-declaration)' })
  @ApiResponse({ status: 200, type: OnboardingStepResult })
  async expertise(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: SubmitExpertiseDto,
  ): Promise<DataResponse<OnboardingStepResult>> {
    const result = await this.submitExpertise.execute(user.id, dto);
    return new DataResponse(200, 'Step Expertise tersimpan', result);
  }

  @Post('assessment')
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 03 — The Inner You (psikometrik / SAKTI Lens)' })
  @ApiResponse({ status: 200, type: OnboardingStepResult })
  async assessment(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: SubmitAssessmentDto,
  ): Promise<DataResponse<OnboardingStepResult>> {
    const result = await this.submitAssessment.execute(user.id, dto);
    return new DataResponse(200, 'Step Assessment tersimpan', result);
  }

  @Post('vision')
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 04 — Your Vision (preferensi karir / hard constraints)' })
  @ApiResponse({ status: 200, type: OnboardingStepResult })
  async vision(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: SubmitVisionDto,
  ): Promise<DataResponse<OnboardingStepResult>> {
    const result = await this.submitVision.execute(user.id, dto);
    return new DataResponse(200, 'Step Vision tersimpan', result);
  }
}
