import {
  Body,
  Controller,
  HttpCode,
  Inject,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  CreateCertificationUseCase,
  CreateEducationUseCase,
  CreateExperienceUseCase,
  CreateProjectUseCase,
  CreateSkillUseCase,
  ParseCvUseCase,
  UpdateIdentityUseCase,
} from './use-cases';
import { CreateCertificationDto } from './use-cases/create-certification/create-certification.dto';
import { CreateEducationDto } from './use-cases/create-education/create-education.dto';
import { CreateExperienceDto } from './use-cases/create-experience/create-experience.dto';
import { CreateProjectDto } from './use-cases/create-project/create-project.dto';
import { CreateSkillDto } from './use-cases/create-skill/create-skill.dto';
import {
  IdentityResponse,
  OnboardingRecordResponse,
  ParseCvResponse,
} from './use-cases/onboarding.response';
import { ParseCvDto } from './use-cases/parse-cv/parse-cv.dto';
import { UpdateIdentityDto } from './use-cases/update-identity/update-identity.dto';
import {
  MAX_CV_FILE_SIZE,
  PdfCvFileValidator,
} from './validators/pdf-cv-file.validator';

@ApiTags('Job Seeker Onboarding')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@RequireRole(AuthRoleEnum.JOB_SEEKER)
@Controller('job-seeker/onboarding')
export class JobSeekerOnboardingController {
  constructor(
    @Inject()
    private readonly parseCvUseCase: ParseCvUseCase,
    @Inject()
    private readonly createEducationUseCase: CreateEducationUseCase,
    @Inject()
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    @Inject()
    private readonly createProjectUseCase: CreateProjectUseCase,
    @Inject()
    private readonly createCertificationUseCase: CreateCertificationUseCase,
    @Inject()
    private readonly createSkillUseCase: CreateSkillUseCase,
    @Inject()
    private readonly updateIdentityUseCase: UpdateIdentityUseCase,
  ) {}

  @Post('cv/parse')
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('cv', {
      limits: { fileSize: MAX_CV_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Parse CV and prepare editable onboarding data' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cv'],
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
          description: 'PDF CV dengan ukuran maksimal 10 MB',
        },
        versionNumber: { type: 'integer', minimum: 1 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'CV berhasil diparsing' })
  async parseCv(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: ParseCvDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new PdfCvFileValidator()],
      }),
    )
    cv: Express.Multer.File,
  ): Promise<DataResponse<ParseCvResponse>> {
    const result = await this.parseCvUseCase.execute(
      currentUser.userId,
      cv,
      dto,
    );
    return new DataResponse<ParseCvResponse>(
      201,
      'CV berhasil diparsing',
      result,
    );
  }

  @Put('identity')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update editable job seeker identity data' })
  @ApiResponse({ status: 200, type: IdentityResponse })
  async updateIdentity(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateIdentityDto,
  ): Promise<DataResponse<IdentityResponse>> {
    const result = await this.updateIdentityUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(200, 'Identitas berhasil disimpan', result);
  }

  @Post('educations')
  @HttpCode(201)
  async createEducation(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateEducationDto,
  ): Promise<DataResponse<OnboardingRecordResponse>> {
    const result = await this.createEducationUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(201, 'Education berhasil disimpan', result);
  }

  @Post('experiences')
  @HttpCode(201)
  async createExperience(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateExperienceDto,
  ): Promise<DataResponse<OnboardingRecordResponse>> {
    const result = await this.createExperienceUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(201, 'Experience berhasil disimpan', result);
  }

  @Post('projects')
  @HttpCode(201)
  async createProject(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateProjectDto,
  ): Promise<DataResponse<OnboardingRecordResponse>> {
    const result = await this.createProjectUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(201, 'Project berhasil disimpan', result);
  }

  @Post('certifications')
  @HttpCode(201)
  async createCertification(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateCertificationDto,
  ): Promise<DataResponse<OnboardingRecordResponse>> {
    const result = await this.createCertificationUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(201, 'Certification berhasil disimpan', result);
  }

  @Post('skills')
  @HttpCode(201)
  async createSkill(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateSkillDto,
  ): Promise<DataResponse<OnboardingRecordResponse>> {
    const result = await this.createSkillUseCase.execute(
      currentUser.userId,
      dto,
    );
    return new DataResponse(201, 'Skill berhasil disimpan', result);
  }
}
