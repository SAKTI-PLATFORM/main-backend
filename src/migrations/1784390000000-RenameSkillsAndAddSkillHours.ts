import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSkillsAndAddSkillHours1784390000000 implements MigrationInterface {
  name = 'RenameSkillsAndAddSkillHours1784390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('skills', 'jobseeker_skills');
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` ADD \`learning_hours\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` ADD \`working_hours\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` DROP COLUMN \`working_hours\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_skills\` DROP COLUMN \`learning_hours\``,
    );
    await queryRunner.renameTable('jobseeker_skills', 'skills');
  }
}
