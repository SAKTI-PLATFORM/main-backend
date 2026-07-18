import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certification } from 'src/domain/entity/certification.entity';
import { RecordSource } from 'src/domain/enums/record-source.enum';
import { Repository } from 'typeorm';
import { OnboardingRecordResponse } from '../onboarding.response';
import { CreateCertificationDto } from './create-certification.dto';

@Injectable()
export class CreateCertificationUseCase {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
  ) {}

  async execute(
    userId: string,
    dto: CreateCertificationDto,
  ): Promise<OnboardingRecordResponse> {
    const certification = this.certificationRepository.create({
      userId,
      certificationName: dto.certificationName,
      issuer: dto.issuer,
      issuedYear: dto.issuedYear ?? null,
      certificateUrl: dto.certificateUrl ?? null,
      source: RecordSource.MANUAL,
    });
    const saved = await this.certificationRepository.save(certification);
    return { id: saved.certificationId };
  }
}
