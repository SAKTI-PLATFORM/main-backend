import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeedJobSeekerUseCase } from './use-cases/seed-job-seeker.use-case';
import { SeedRecruiterUseCase } from './use-cases/seed-recruiter.use-case';

@Module({
  providers: [SeederService, SeedJobSeekerUseCase, SeedRecruiterUseCase],
  exports: [SeederService],
})
export class SeederModule {}
