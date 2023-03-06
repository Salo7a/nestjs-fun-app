import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as NodeGeocoder from 'node-geocoder';
import { UserDto, NewUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /** * Reverse Geocodes given coordinates
   *
   * @param {number} lat latitude of the location
   * @param {number} lon longitude of the location
   *
   * @throws HttpException If connection to reverse decoding provide failed
   * @return {NodeGeocoder.Entry[]} Location details of the given coordinates
   */
  async getLocation(lat: number, lon: number): Promise<NodeGeocoder.Entry[]> {
    try {
      const geocoder = NodeGeocoder({
        provider: 'opencage',
        apiKey: process.env.OPENCAGE_API,
      });

      return await geocoder.reverse({ lat, lon });
    } catch (e) {
      throw new HttpException(
        'Failed To Parse Location Data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** * Verifies that valid location details was given and that the location lies in the US
   *
   * @param {NodeGeocoder.Entry} geoData location details from the NodeGeocoder Library
   *
   * @throws HttpException If the geoData was empty, thus the coordinates didn't correspond to any known city
   * @throws HttpException If the location wasn't in the US
   */
  verifyLocation(geoData) {
    // Checks if a location corresponding
    if (geoData.length === 0)
      throw new HttpException('Invalid Location', HttpStatus.BAD_REQUEST);

    // TODO: Don't Hardcode Banned/Allowed Countries
    if (geoData[0].country !== 'United States')
      throw new HttpException(
        'This service is not currently available in your region',
        HttpStatus.BAD_REQUEST,
      );
  }
  /** * Finds the user with the given id
   *
   * @param {number} id Id of the user to find
   *
   * @throws NotFoundException If no user with the given id was found
   * @return {Promise<UserDto>} Data of the user
   */
  async findUser(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new NotFoundException(`A user with the id ${id} wasn't found`);
    return user;
  }

  /** * Reverse Geocodes given coordinates
   * @param newUserData
   *
   * @throws HttpException If a user with the given email was found
   * @return {Promise<UserDto>} The created user's data
   */
  async create(newUserData: NewUserDto): Promise<UserDto> {
    const existing = await this.userRepository.findOneBy({
      email: newUserData.email,
    });
    if (existing)
      throw new HttpException(
        'A user with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.userRepository.create(newUserData);
    return this.userRepository.save(user);
  }

  /** * Clears the DB if run in test environment
   *
   * @throws Error If run in non-test environment
   */
  async clear() {
    if (process.env.NODE_ENV !== 'test')
      throw new Error('This function cannot run in non-test environment');
    await this.userRepository.clear();
  }
}
