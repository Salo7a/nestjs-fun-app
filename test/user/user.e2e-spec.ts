import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UserModule } from '../../src/modules/user/user.module';
import { UserService } from '../../src/modules/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserDto } from '../../src/modules/user/dto';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';

describe('[Feature] user - /user', () => {
  const newUser = {
    email: 'test@example.com',
    name: 'John Doe',
    latitude: 37.77493,
    longitude: -122.41942,
  };
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        UserModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST,
          port: +process.env.TEST_DB_PORT,
          username: process.env.TEST_DB_USERNAME,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    userService = moduleFixture.get<UserService>(UserService);

    await userService.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userService.clear();
  });

  describe('[POST /signup]', () => {
    describe('when provided with valid data', () => {
      it('should create a new user successfully and return his data', async () => {
        const response = await request(app.getHttpServer())
          .post('/user/signup')
          .send(newUser as CreateUserDto)
          .expect(HttpStatus.CREATED);

        const data = response.body;
        expect(data.id).toBeDefined();
        expect(data.city).toEqual('San Francisco');
        expect(data.state).toEqual('California');
        expect(data.email).toEqual(newUser.email);
      });
    });

    describe('otherwise', () => {
      it('should throw an error when signing up with an existing email', async () => {
        await request(app.getHttpServer())
          .post('/user/signup')
          .send(newUser as CreateUserDto)
          .expect(HttpStatus.CREATED);
        const response = await request(app.getHttpServer())
          .post('/user/signup')
          .send(newUser as CreateUserDto)
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          'A user with this email already exists',
        );
      });

      it('should throw an error when data is in an invalid format', async () => {
        const badUser = {
          email: 'testexample.com',
          latitude: 3477.77493,
          longitude: '-12k2.41942',
        };
        await request(app.getHttpServer())
          .post('/user/signup')
          .send(badUser)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should throw an error when the location is outside the supported regions', async () => {
        const badUser = {
          email: 'test@example.com',
          name: 'John Doe',
          latitude: 37.77493,
          longitude: 122.41942,
        };
        const response = await request(app.getHttpServer())
          .post('/user/signup')
          .send(badUser)
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          'This service is not currently available in your region',
        );
      });
    });
  });

  describe('[GET /:id]', () => {
    describe('when provided with valid id', () => {
      it("should retrieve user's data", async () => {
        const createUserResponse = await request(app.getHttpServer())
          .post('/user/signup')
          .send(newUser as CreateUserDto)
          .expect(HttpStatus.CREATED);

        const createdUser = createUserResponse.body;

        const userDataResponse = await request(app.getHttpServer())
          .get(`/user/${createdUser.id}`)
          .expect(HttpStatus.OK);

        expect(userDataResponse.body.email).toEqual(newUser.email);
      });
    });

    describe('otherwise', () => {
      it("should throw an error if user wasn't found", async () => {
        await request(app.getHttpServer())
          .get('/user/5')
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
