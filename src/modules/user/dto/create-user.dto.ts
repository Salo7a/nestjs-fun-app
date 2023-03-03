import { IsString, IsEmail, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: "User's Full Name",
    example: 'John Doe',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: "User's Unique Email",
    example: 'test@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: "User's location latitude",
    type: 'decimal',
    example: 37.77493,
  })
  @IsLatitude()
  readonly latitude: number;

  @ApiProperty({
    description: "User's location longitude",
    type: 'decimal',
    example: -122.41942,
  })
  @IsLongitude()
  readonly longitude: number;
}
