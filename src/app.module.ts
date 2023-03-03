import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_HOST: Joi.required().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.required(),
        DB_PASSWORD: Joi.required(),
        DB_NAME: Joi.required(),
        OPENCAGE_API: Joi.required(),
      }),
    }),
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
