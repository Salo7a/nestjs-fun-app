import { IsString, IsEmail } from 'class-validator';

export class NewUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly city: string;

  @IsString()
  readonly state: string;
}
