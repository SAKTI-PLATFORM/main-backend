import { BadRequestException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { PasswordHasher } from 'src/libs/PasswordHasher/PasswordHasher';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { UserRoleEnum } from '../enums/user-role.enum';
import { ITimestamp } from './abstract/timestamp.entity';
import { JobseekerProfile } from './jobseeker-profile.entity';
import { UserRole } from './user-role.entity';

@Entity({ name: 'user' })
export class User extends ITimestamp {
  @PrimaryColumn({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: true,
  })
  @Exclude()
  passwordHash?: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, name: 'google_id', nullable: true })
  @Exclude()
  googleId?: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber?: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 2048, nullable: true })
  photoUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domicile?: string | null;

  @BeforeInsert()
  private generateId(): void {
    if (!this.userId) {
      this.userId = uuidv7();
    }
  }

  @OneToMany(() => UserRole, (userRole: UserRole) => userRole.user, {
    cascade: ['insert'],
  })
  userRoles!: UserRole[];

  @OneToOne(() => JobseekerProfile, (profile) => profile.user, {
    cascade: ['insert'],
  })
  jobseekerProfile?: JobseekerProfile;

  public getRoleNames(): UserRoleEnum[] {
    return this.userRoles.map((role: UserRole) => role.role);
  }

  public getJobSeekerRole(): UserRole | undefined {
    return this.userRoles.find(
      (role: UserRole) => role.role === UserRoleEnum.JOB_SEEKER,
    );
  }

  public getRecruiterRole(): UserRole | undefined {
    return this.userRoles.find(
      (role: UserRole) => role.role === UserRoleEnum.RECRUITER,
    );
  }

  public static async create(params: {
    email: string;
    password: string;
    confirmationPassword: string;
    fullName?: string;
  }): Promise<User> {
    const { email, password, confirmationPassword, fullName } = params;
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
    user.fullName = fullName ?? normalizedEmail.split('@')[0];
    user.passwordHash = await PasswordHasher.hash(password);
    return user;
  }

  public static createWithGoogle(params: {
    email: string;
    googleId: string;
    fullName: string;
  }): User {
    const { email, googleId, fullName } = params;
    const user = new User();
    user.email = email.trim().toLowerCase();
    user.fullName = fullName;
    user.googleId = googleId;
    user.passwordHash = null;
    return user;
  }
}
