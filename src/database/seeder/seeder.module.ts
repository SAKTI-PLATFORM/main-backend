import { Module } from '@nestjs/common';
import { SeedJobSeekerUseCase } from './use-cases/seed-job-seeker.use-case';
import { SeedRecruiterUseCase } from './use-cases/seed-recruiter.use-case';
import { SeederService } from './seeder.service';

@Module({
  providers: [SeederService, SeedJobSeekerUseCase, SeedRecruiterUseCase],
  exports: [SeederService],
})
export class SeederModule {}
