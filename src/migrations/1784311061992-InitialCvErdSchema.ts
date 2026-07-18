import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialCvErdSchema1784311061992 implements MigrationInterface {
  name = 'InitialCvErdSchema1784311061992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`jobseeker_profile\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` char(36) NOT NULL, \`domicile\` varchar(255) NULL, PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_role\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` char(36) NOT NULL, \`role\` enum ('JOB_SEEKER', 'RECRUITER') NOT NULL, PRIMARY KEY (\`user_id\`, \`role\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` char(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NULL, \`google_id\` varchar(255) NULL, \`phone_number\` varchar(30) NULL, \`photo_url\` varchar(2048) NULL, \`domicile\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_7adac5c0b28492eb292d4a9387\` (\`google_id\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`project\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`project_id\` char(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`project_name\` varchar(255) NOT NULL, \`description\` text NULL, \`tools_used\` varchar(1000) NULL, \`start_date\` date NULL, \`end_date\` date NULL, \`source\` enum ('CV', 'MANUAL', 'HYBRID') NOT NULL, PRIMARY KEY (\`project_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cv_document\` (\`cv_id\` varchar(255) NOT NULL, \`user_id\` char(36) NOT NULL, \`version_number\` int NOT NULL, \`file_name\` varchar(255) NOT NULL, \`file_type\` varchar(100) NOT NULL, \`file_url\` varchar(2048) NOT NULL, \`upload_status\` varchar(50) NOT NULL, \`parse_status\` varchar(50) NOT NULL, \`uploaded_at\` datetime NOT NULL, PRIMARY KEY (\`cv_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`parsed_cv_data\` (\`parsed_id\` char(36) NOT NULL, \`cv_id\` varchar(255) NOT NULL, \`confidence_score\` float NULL, \`raw_result_json\` longtext NOT NULL, \`parsed_at\` datetime NOT NULL, PRIMARY KEY (\`parsed_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`experience\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`experience_id\` char(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`title\` varchar(200) NOT NULL, \`organization\` varchar(255) NOT NULL, \`experience_type\` varchar(100) NOT NULL, \`start_date\` date NULL, \`end_date\` date NULL, \`is_current\` tinyint NOT NULL DEFAULT 0, \`duration_months\` int NULL, \`description\` text NULL, \`source\` enum ('CV', 'MANUAL', 'HYBRID') NOT NULL, PRIMARY KEY (\`experience_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`skills\` (\`user_skill_id\` char(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`skill_id\` char(36) NOT NULL, \`detected_text\` varchar(255) NULL, \`inferred_level\` varchar(100) NULL, \`confidence_score\` float NULL, \`evidence_source\` varchar(255) NULL, \`evidence_strength\` varchar(100) NULL, PRIMARY KEY (\`user_skill_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`education\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`education_id\` char(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`education_level\` enum ('SMA', 'D3', 'S1', 'S2', 'S3') NULL, \`institution\` varchar(200) NULL, \`major\` varchar(200) NULL, \`degree\` varchar(255) NOT NULL, \`start_year\` int NULL, \`end_year\` int NULL, \`gpa\` decimal(4,2) NULL, \`is_current\` tinyint NOT NULL DEFAULT 0, \`source\` enum ('CV', 'MANUAL', 'HYBRID') NOT NULL, PRIMARY KEY (\`education_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`certification\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`certification_id\` char(36) NOT NULL, \`user_id\` char(36) NOT NULL, \`certification_name\` varchar(255) NOT NULL, \`issuer\` varchar(255) NOT NULL, \`issued_year\` int NULL, \`certificate_url\` varchar(2048) NULL, \`source\` enum ('CV', 'MANUAL', 'HYBRID') NOT NULL, PRIMARY KEY (\`certification_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` ADD CONSTRAINT \`FK_467d5ee08b9483b0bdf5bd45792\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` ADD CONSTRAINT \`FK_d0e5815877f7395a198a4cb0a46\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`project\` ADD CONSTRAINT \`FK_1cf56b10b23971cfd07e4fc6126\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cv_document\` ADD CONSTRAINT \`FK_c5c40eadd0ef0d3bf6e40832b65\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`parsed_cv_data\` ADD CONSTRAINT \`FK_f84e9c337764730d49eb60c06e8\` FOREIGN KEY (\`cv_id\`) REFERENCES \`cv_document\`(\`cv_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`experience\` ADD CONSTRAINT \`FK_62c0623650986849f3fc1d148e7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`skills\` ADD CONSTRAINT \`FK_b6037133328ed50f9b66cd547de\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`education\` ADD CONSTRAINT \`FK_5bfcef10ecdda36d2ee68aa2049\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`certification\` ADD CONSTRAINT \`FK_eb73bbd42fe190a56ad42417b71\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`certification\` DROP FOREIGN KEY \`FK_eb73bbd42fe190a56ad42417b71\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`education\` DROP FOREIGN KEY \`FK_5bfcef10ecdda36d2ee68aa2049\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`skills\` DROP FOREIGN KEY \`FK_b6037133328ed50f9b66cd547de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`experience\` DROP FOREIGN KEY \`FK_62c0623650986849f3fc1d148e7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`parsed_cv_data\` DROP FOREIGN KEY \`FK_f84e9c337764730d49eb60c06e8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cv_document\` DROP FOREIGN KEY \`FK_c5c40eadd0ef0d3bf6e40832b65\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`project\` DROP FOREIGN KEY \`FK_1cf56b10b23971cfd07e4fc6126\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_d0e5815877f7395a198a4cb0a46\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobseeker_profile\` DROP FOREIGN KEY \`FK_467d5ee08b9483b0bdf5bd45792\``,
    );
    await queryRunner.query(`DROP TABLE \`certification\``);
    await queryRunner.query(`DROP TABLE \`education\``);
    await queryRunner.query(`DROP TABLE \`skills\``);
    await queryRunner.query(`DROP TABLE \`experience\``);
    await queryRunner.query(`DROP TABLE \`parsed_cv_data\``);
    await queryRunner.query(`DROP TABLE \`cv_document\``);
    await queryRunner.query(`DROP TABLE \`project\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7adac5c0b28492eb292d4a9387\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`user_role\``);
    await queryRunner.query(`DROP TABLE \`jobseeker_profile\``);
  }
}
