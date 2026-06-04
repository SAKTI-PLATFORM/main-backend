import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeekerProfilePhone1779494400003 implements MigrationInterface {
  name = 'AddSeekerProfilePhone1779494400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`seeker_profiles\` ADD \`phone\` varchar(30) NULL AFTER \`user_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`seeker_profiles\` DROP COLUMN \`phone\``,
    );
  }
}
