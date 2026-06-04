import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeekerProfileTables1779494400002 implements MigrationInterface {
  name = 'CreateSeekerProfileTables1779494400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`seeker_profiles\` (
        \`id\` varchar(255) NOT NULL,
        \`user_id\` varchar(255) NOT NULL,
        \`dob\` date NULL,
        \`gender\` enum ('male', 'female') NULL,
        \`employment_status\` enum ('fresh_grad', 'working', 'unemployed', 'freelance') NULL,
        \`education_level\` enum ('SMA', 'D3', 'S1', 'S2', 'S3') NULL,
        \`field\` enum ('teknologi', 'keuangan', 'kesehatan', 'pendidikan', 'manufaktur', 'kreatif', 'lainnya') NULL,
        \`ocean_scores\` json NULL,
        \`ocean_trait_confidence\` json NULL,
        \`riasec_scores\` json NULL,
        \`riasec_raw\` json NULL,
        \`holland_code\` varchar(3) NULL,
        \`ocean_confidence\` decimal(5,2) NULL,
        \`profile_completeness\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`employability_score\` decimal(5,2) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_seeker_profiles_user_id\` (\`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`seeker_skills\` (
        \`id\` varchar(255) NOT NULL,
        \`seeker_id\` varchar(255) NOT NULL,
        \`name\` varchar(150) NOT NULL,
        \`category\` enum ('tool', 'knowledge', 'soft') NOT NULL,
        \`source\` enum ('cv', 'declared') NOT NULL,
        \`proficiency\` decimal(4,3) NULL,
        \`confidence\` decimal(4,3) NULL,
        \`hours_estimate\` int NULL,
        \`evidence\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_seeker_skills_seeker_name_source\` (\`seeker_id\`, \`name\`, \`source\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`experiences\` (
        \`id\` varchar(255) NOT NULL,
        \`seeker_id\` varchar(255) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`company\` varchar(200) NULL,
        \`start_date\` date NULL,
        \`end_date\` date NULL,
        \`is_current\` tinyint NOT NULL DEFAULT 0,
        \`description\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`educations\` (
        \`id\` varchar(255) NOT NULL,
        \`seeker_id\` varchar(255) NOT NULL,
        \`degree\` enum ('SMA', 'D3', 'S1', 'S2', 'S3') NULL,
        \`major\` varchar(200) NULL,
        \`institution\` varchar(200) NULL,
        \`year\` int NULL,
        \`gpa\` decimal(4,2) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`assessments\` (
        \`id\` varchar(255) NOT NULL,
        \`seeker_id\` varchar(255) NOT NULL,
        \`instrument\` enum ('bfi10', 'riasec42') NOT NULL,
        \`responses\` json NOT NULL,
        \`scores\` json NULL,
        \`confidence\` decimal(5,2) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`career_preferences\` (
        \`id\` varchar(255) NOT NULL,
        \`seeker_id\` varchar(255) NOT NULL,
        \`target_role\` varchar(150) NULL,
        \`salary_min\` int NULL,
        \`salary_max\` int NULL,
        \`work_modes\` json NULL,
        \`company_types\` json NULL,
        \`job_types\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_career_preferences_seeker_id\` (\`seeker_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`seeker_profiles\` ADD CONSTRAINT \`FK_seeker_profiles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`seeker_skills\` ADD CONSTRAINT \`FK_seeker_skills_seeker_id\` FOREIGN KEY (\`seeker_id\`) REFERENCES \`seeker_profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`experiences\` ADD CONSTRAINT \`FK_experiences_seeker_id\` FOREIGN KEY (\`seeker_id\`) REFERENCES \`seeker_profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`educations\` ADD CONSTRAINT \`FK_educations_seeker_id\` FOREIGN KEY (\`seeker_id\`) REFERENCES \`seeker_profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`assessments\` ADD CONSTRAINT \`FK_assessments_seeker_id\` FOREIGN KEY (\`seeker_id\`) REFERENCES \`seeker_profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`career_preferences\` ADD CONSTRAINT \`FK_career_preferences_seeker_id\` FOREIGN KEY (\`seeker_id\`) REFERENCES \`seeker_profiles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`career_preferences\` DROP FOREIGN KEY \`FK_career_preferences_seeker_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`assessments\` DROP FOREIGN KEY \`FK_assessments_seeker_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`educations\` DROP FOREIGN KEY \`FK_educations_seeker_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`experiences\` DROP FOREIGN KEY \`FK_experiences_seeker_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`seeker_skills\` DROP FOREIGN KEY \`FK_seeker_skills_seeker_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`seeker_profiles\` DROP FOREIGN KEY \`FK_seeker_profiles_user_id\``,
    );
    await queryRunner.query(`DROP TABLE \`career_preferences\``);
    await queryRunner.query(`DROP TABLE \`assessments\``);
    await queryRunner.query(`DROP TABLE \`educations\``);
    await queryRunner.query(`DROP TABLE \`experiences\``);
    await queryRunner.query(`DROP TABLE \`seeker_skills\``);
    await queryRunner.query(`DROP TABLE \`seeker_profiles\``);
  }
}
