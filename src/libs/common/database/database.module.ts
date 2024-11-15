import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(models: any[]) {
    return SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: Number(configService.get('MYSQL_PORT')),
        username: configService.get('MYSQL_USERNAME'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DBNAME'),
        pool: {
          max: 50,
          min: 0,
          idle: 10000,
        },
        models,
      }),
      inject: [ConfigService],
    });
  }
  static forFeature(models: any[]) {
    return SequelizeModule.forFeature(models);
  }
}
