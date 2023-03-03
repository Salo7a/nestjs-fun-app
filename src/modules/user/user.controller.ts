import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserDto } from './dto';

import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiNotFoundResponse({
    description: 'No user with the given id was found',
  })
  @Get(':id')
  getUser(@Param('id') id: number) {
    return this.userService.findUser(id);
  }

  @ApiBadRequestResponse({
    description:
      "Input Data's Validation Failed, Incorrect coordinates or out-of-zone or email exists",
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed To Parse Location Data',
  })
  @Post('/signup')
  async signup(@Body() createUserData: CreateUserDto): Promise<UserDto> {
    // Get Location Info
    const loc = await this.userService.getLocation(
      +createUserData.latitude,
      +createUserData.longitude,
    );

    // Verify That the User is In the US
    this.userService.verifyLocation(loc);

    const { state, city } = loc[0];

    return await this.userService.create({
      email: createUserData.email,
      name: createUserData.name,
      state,
      city,
    });
  }
}
