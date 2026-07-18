import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSkillInferredLevel1784391000000 implements MigrationInterface {
  name = 'RemoveSkillInferredLevel1784391000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` DROP COLUMN \`inferred_level\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` ADD \`inferred_level\` varchar(100) NULL AFTER \`detected_text\``,
    );
  }
}
