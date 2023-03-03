import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { HttpException, NotFoundException } from "@nestjs/common";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUser', () => {
    describe('when a user with the given ID exists', () => {
      it('should return the user object', async () => {
        const userId = 1;
        const expectedUser = {
          id: 1,
          name: 'John Doe',
          city: 'San Francisco',
          state: 'California',
        };

        userRepository.findOneBy.mockReturnValue(expectedUser);
        const user = await service.findUser(userId);
        expect(user).toEqual(expectedUser);
      });
    });

    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        const userId = 1;
        userRepository.findOneBy.mockReturnValue(null);

        try {
          await service.findUser(userId);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(
            `A user with the id ${userId} wasn't found`,
          );
        }
      });
    });
  });

  describe('create', () => {
    describe('when a user tries to signup with valid data and non-existing email', () => {
      it('should return the created user object', async () => {
        const newUser = {
          email: 'test@example.com',
          name: 'John Doe',
          city: 'San Francisco',
          state: 'California',
        };

        userRepository.findOneBy.mockReturnValue(null);
        userRepository.save.mockReturnValue({ ...newUser, id: 1 });
        const user = await service.create(newUser);
        expect(user.id).toEqual(1);
        expect(user.city).toEqual(newUser.city);
      });
    });

    describe('otherwise', () => {
      describe('when the email is already registered', () => {
        it('should throw a HttpException', async () => {
          const newUser = {
            email: 'test@example.com',
            name: 'John Doe',
            city: 'San Francisco',
            state: 'California',
          };

          userRepository.findOneBy.mockReturnValue({ ...newUser, id: 1 });
          userRepository.save.mockReturnValue({ ...newUser, id: 1 });

          try {
            await service.create(newUser);
          } catch (err) {
            expect(err).toBeInstanceOf(HttpException);
            expect(err.message).toEqual(
              `A user with this email already exists`,
            );
          }
        });
      });
    });
  });

  describe('getLocation', () => {
    describe('when the given coordinates are correct', () => {
      it('should return the details of the location pinpointed by the coordinates', async () => {
        const lat = 37.77493;
        const long = -122.41942;
        const expectedLocation = [
          {
            country: 'United States',
            city: 'San Francisco',
            state: 'California',
        }];

        const location = await service.getLocation(lat, long);
        expect(location.length).not.toEqual(0);
        expect(location[0].country).toEqual(expectedLocation[0].country);
        expect(location[0].city).toEqual(expectedLocation[0].city);
        expect(location[0].state).toEqual(expectedLocation[0].state);
      });
    });
  });

  describe('verifyLocation', () => {
    describe('when the given location is valid and exists in the supported regions', () => {
      it('should return with no errors', async () => {
        const expectedLocation = [
          {
            country: 'United States',
            city: 'San Francisco',
            state: 'California',
          },
        ];

        service.verifyLocation(expectedLocation);
        return;
      });
    });
    describe('otherwise', () => {
      it('should throw a HttpException when an empty location array is given', async () => {
        const givenLocation = [];

        try {
          service.verifyLocation(givenLocation);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toEqual(`Invalid Location`);
        }
      });
      it('should throw a HttpException when the location is in an unsupported region', async () => {
        const givenLocation = [
          {
            country: 'UAE',
            city: 'Dubai',
            state: 'Dubai',
          },
        ];

        try {
          service.verifyLocation(givenLocation);
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toEqual(`This service is not currently available in your region`);
        }
      });
    });
  });
});
