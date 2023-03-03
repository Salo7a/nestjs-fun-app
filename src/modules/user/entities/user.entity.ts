import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'None',
  })
  state: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'None',
  })
  city: string;
}
