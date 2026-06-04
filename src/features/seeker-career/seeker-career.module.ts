import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SeekerProfile } from 'src/domain/entity/seeker-profile.entity';
import { SeekerSkill } from 'src/domain/entity/seeker-skill.entity';
import { SeekerCareerController } from './seeker-career.controller';
import { SeekerCareerService } from './seeker-career.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeekerProfile, SeekerSkill]), AuthModule],
  controllers: [SeekerCareerController],
  providers: [SeekerCareerService],
  exports: [SeekerCareerService],
})
export class SeekerCareerModule {}
