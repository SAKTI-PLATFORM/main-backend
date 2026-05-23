import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireRole } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthRoleEnum } from 'src/auth/enums/auth.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { ICurrentUser } from 'src/auth/interfaces/current-user.interface';
import { DataResponse, MessageResponse } from 'src/infrastructure/core/http/http-response';
import { ProfileResponse } from 'src/libs/Mapper/UserMapper';
import {
  GetProfileUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
} from './use-cases';
import { GoogleAuthDto } from './use-cases/google-auth/google-auth.dto';
import { LoginDto } from './use-cases/login/login.dto';
import { RegisterDto } from './use-cases/register/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class UserAuthController {
  constructor(
    @Inject()
    private readonly registerUseCase: RegisterUseCase,
    @Inject()
    private readonly loginUseCase: LoginUseCase,
    @Inject()
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    @Inject()
    private readonly getProfileUseCase: GetProfileUseCase,
    @Inject()
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register',
    description: 'Daftarkan akun baru sebagai Job Seeker atau Recruiter',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<DataResponse<IAuthToken>> {
    const token: IAuthToken = await this.registerUseCase.execute(dto);
    return new DataResponse<IAuthToken>(201, 'Registrasi berhasil', token);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login',
    description: 'Login dengan email dan password',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(
    @Body() dto: LoginDto,
  ): Promise<DataResponse<IAuthToken>> {
    const token: IAuthToken = await this.loginUseCase.execute(dto);
    return new DataResponse<IAuthToken>(200, 'Login berhasil', token);
  }

  @Post('google')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login / Register dengan Google',
    description:
      'Autentikasi menggunakan Google ID token. Jika user belum terdaftar, sertakan field role.',
  })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({ status: 200, description: 'Autentikasi Google berhasil' })
  @ApiResponse({ status: 400, description: 'Role diperlukan untuk user baru' })
  @ApiResponse({ status: 401, description: 'Token Google tidak valid' })
  async googleAuth(
    @Body() dto: GoogleAuthDto,
  ): Promise<DataResponse<IAuthToken>> {
    const token: IAuthToken = await this.googleAuthUseCase.execute(dto);
    return new DataResponse<IAuthToken>(200, 'Autentikasi Google berhasil', token);
  }

  @Get('me')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @RequireRole(AuthRoleEnum.ANY)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Profile',
    description: 'Ambil profil user yang sedang login',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diambil',
    type: ProfileResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  async getProfile(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DataResponse<ProfileResponse>> {
    const profile: ProfileResponse = await this.getProfileUseCase.execute(
      currentUser.id,
    );
    return new DataResponse<ProfileResponse>(200, 'Profil berhasil diambil', profile);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @RequireRole(AuthRoleEnum.ANY)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout dan invalidate token aktif',
  })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  async logout(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<MessageResponse> {
    await this.logoutUseCase.execute(currentUser);
    return new MessageResponse(200, 'Logout berhasil');
  }
}
