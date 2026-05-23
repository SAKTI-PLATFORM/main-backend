import { BadRequestException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { UserRoleEnum } from '../enums/user-role.enum';
import { ITimestamp } from './abstract/timestamp.entity';
import { UserRole } from './user-role.entity';

@Entity({ name: 'users' })
export class User extends ITimestamp {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'hashed_password',
    nullable: true,
  })
  @Exclude()
  hashedPassword?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'google_id', nullable: true })
  @Exclude()
  googleId?: string | null;

  @Column({
    type: 'text',
    name: 'active_token',
    nullable: true,
  })
  @Exclude()
  activeToken?: string | null;

  @BeforeInsert()
  private generateId(): void {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @OneToMany(() => UserRole, (userRole: UserRole) => userRole.user, {
    cascade: ['insert'],
  })
  userRoles: UserRole[];

  public getRoleNames(): UserRoleEnum[] {
    return this.userRoles.map((role: UserRole) => role.roleName);
  }

  public getJobSeekerRole(): UserRole | undefined {
    return this.userRoles.find(
      (role: UserRole) => role.roleName === UserRoleEnum.JOB_SEEKER,
    );
  }

  public getRecruiterRole(): UserRole | undefined {
    return this.userRoles.find(
      (role: UserRole) => role.roleName === UserRoleEnum.RECRUITER,
    );
  }

  public static async create(params: {
    email: string;
    password: string;
    confirmationPassword: string;
    username?: string;
  }): Promise<User> {
    const { email, password, confirmationPassword, username } = params;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.includes(' ')) {
      throw new BadRequestException('Format email tidak valid');
    }
    if (password !== confirmationPassword) {
      throw new BadRequestException(
        'Password dan Confirmation Password tidak sesuai',
      );
    }
    const user = new User();
    user.email = normalizedEmail;
    user.username = username ?? normalizedEmail.split('@')[0];
    user.hashedPassword = await PasswordHasher.hash(password);
    return user;
  }

  public static createWithGoogle(params: {
    email: string;
    googleId: string;
    username: string;
  }): User {
    const { email, googleId, username } = params;
    const user = new User();
    user.email = email.trim().toLowerCase();
    user.username = username;
    user.googleId = googleId;
    user.hashedPassword = null;
    return user;
  }
}
