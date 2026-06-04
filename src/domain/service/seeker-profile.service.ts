import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPreference } from '../entity/career-preference.entity';
import { SeekerProfile } from '../entity/seeker-profile.entity';
import { SeekerSkill } from '../entity/seeker-skill.entity';

/**
 * Shared seeker-profile lifecycle: lazily create the profile on first onboarding
 * step and keep `profile_completeness` in sync after each step. Used by every
 * onboarding use-case and the dashboard so the logic lives in one place.
 */
@Injectable()
export class SeekerProfileService {
  constructor(
    @InjectRepository(SeekerProfile)
    private readonly profiles: Repository<SeekerProfile>,
    @InjectRepository(SeekerSkill)
    private readonly skills: Repository<SeekerSkill>,
    @InjectRepository(CareerPreference)
    private readonly preferences: Repository<CareerPreference>,
  ) {}

  public async getOrCreate(userId: string): Promise<SeekerProfile> {
    const existing = await this.profiles.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }
    return this.profiles.save(SeekerProfile.createForUser(userId));
  }

  public findByUserId(userId: string): Promise<SeekerProfile | null> {
    return this.profiles.findOne({ where: { userId } });
  }

  public save(profile: SeekerProfile): Promise<SeekerProfile> {
    return this.profiles.save(profile);
  }

  /** Recompute completeness from sibling-table presence, then persist. */
  public async refreshCompleteness(
    profile: SeekerProfile,
  ): Promise<SeekerProfile> {
    const [skillCount, preferenceCount] = await Promise.all([
      this.skills.count({ where: { seekerId: profile.id } }),
      this.preferences.count({ where: { seekerId: profile.id } }),
    ]);
    profile.recomputeCompleteness({
      hasSkills: skillCount > 0,
      hasPreference: preferenceCount > 0,
    });
    return this.profiles.save(profile);
  }
}
