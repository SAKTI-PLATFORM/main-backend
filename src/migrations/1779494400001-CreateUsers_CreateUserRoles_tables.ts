import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersCreateUserRolesTables1779494400001 implements MigrationInterface {
  name = 'CreateUsersCreateUserRolesTables1779494400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (
        \`id\` varchar(255) NOT NULL,
        \`username\` varchar(100) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`hashed_password\` varchar(255) NULL,
        \`google_id\` varchar(255) NULL,
        \`active_token\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles\` (
        \`user_id\` varchar(255) NOT NULL,
        \`role_name\` enum ('JOB_SEEKER', 'RECRUITER') NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`user_id\`, \`role_name\`)
      ) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_user_id\``,
    );
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
