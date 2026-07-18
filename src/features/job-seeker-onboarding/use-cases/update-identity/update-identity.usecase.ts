import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobseekerProfile } from 'src/domain/entity/jobseeker-profile.entity';
import { User } from 'src/domain/entity/user.entity';
import { DataSource, Not } from 'typeorm';
import { IdentityResponse } from '../onboarding.response';
import { UpdateIdentityDto } from './update-identity.dto';

@Injectable()
export class UpdateIdentityUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    userId: string,
    dto: UpdateIdentityDto,
  ): Promise<IdentityResponse> {
    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const profileRepository = manager.getRepository(JobseekerProfile);
      const user = await userRepository.findOne({ where: { userId } });
      if (!user) throw new NotFoundException('User tidak ditemukan');

      const email = dto.email.trim().toLowerCase();
      const emailTaken = await userRepository.exists({
        where: { email, userId: Not(userId) },
      });
      if (emailTaken) throw new ConflictException('Email sudah digunakan');

      user.fullName = dto.fullName.trim();
      user.email = email;
      user.phoneNumber = this.optionalText(dto.phoneNumber);
      user.domicile = this.optionalText(dto.domicile);

      let profile = await profileRepository.findOne({ where: { userId } });
      if (!profile) profile = profileRepository.create({ userId });
      profile.domicile = user.domicile;
      profile.professionalHeadline = this.optionalText(
        dto.professionalHeadline,
      );
      profile.linkedinUrl = this.optionalText(dto.linkedinUrl);
      profile.profileSummary = this.optionalText(dto.profileSummary);

      await userRepository.save(user);
      await profileRepository.save(profile);

      return {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? null,
        domicile: user.domicile ?? null,
        professionalHeadline: profile.professionalHeadline ?? null,
        linkedinUrl: profile.linkedinUrl ?? null,
        profileSummary: profile.profileSummary ?? null,
      };
    });
  }

  private optionalText(value?: string): string | null {
    const normalized = value?.trim();
    return normalized || null;
  }
}
