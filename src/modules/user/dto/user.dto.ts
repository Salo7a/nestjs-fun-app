import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: "User's Id",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({
    description: "User's Full Name",
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: "User's Email",
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: "User's City",
    example: 'San Francisco',
  })
  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @ApiProperty({
    description: "User's State",
    example: 'California',
  })
  @IsNotEmpty()
  @IsString()
  readonly state: string;
}
