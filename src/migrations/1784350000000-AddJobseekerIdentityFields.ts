import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobseekerIdentityFields1784350000000 implements MigrationInterface {
  name = 'AddJobseekerIdentityFields1784350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` ADD \`professional_headline\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` ADD \`linkedin_url\` varchar(2048) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` ADD \`profile_summary\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` DROP COLUMN \`profile_summary\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` DROP COLUMN \`linkedin_url\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` DROP COLUMN \`professional_headline\``,
    );
  }
}
