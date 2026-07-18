import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserRoleEnum } from '../enums/user-role.enum';
import { ITimestamp } from './abstract/timestamp.entity';
import { User } from './user.entity';

@Entity({ name: 'user_role' })
export class UserRole extends ITimestamp {
  @PrimaryColumn({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @PrimaryColumn({
    type: 'enum',
    enum: UserRoleEnum,
    name: 'role',
  })
  role!: UserRoleEnum;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
