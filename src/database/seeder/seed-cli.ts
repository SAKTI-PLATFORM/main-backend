/* eslint-disable no-console */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import app from 'src/infrastructure/config/app/app.config';
import { dataSourceOptions } from 'src/infrastructure/config/database/typeorm.config';
import environmentValidation from 'src/infrastructure/config/environment.validation';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

const env: string = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${env}`,
      load: [app],
      validationSchema: environmentValidation,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      logging: false,
      autoLoadEntities: true,
    }),
    SeederModule,
  ],
})
class SeedAppModule {}

async function bootstrap(): Promise<void> {
  const nestApp = await NestFactory.createApplicationContext(SeedAppModule);

  const seederService = nestApp.get(SeederService);

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'seed':
        console.log('Running database seeder...');
        await seederService.seed();
        console.log('✅ Seeding completed!');
        break;

      case 'clear':
        console.log('Clearing seeded data...');
        await seederService.clear();
        console.log('✅ Data cleared!');
        break;

      case 'reset':
        console.log('Resetting database (clear + seed)...');
        await seederService.reset();
        console.log('✅ Reset completed!');
        break;

      case 'truncate':
        console.log('⚠️ Truncating all tables...');
        await seederService.truncate();
        console.log('✅ Truncation completed!');
        break;

      default:
        console.log(`
          Usage: npm run seed [command]

          Commands:
            seed      Run the database seeder
            clear     Clear all seeded data
            reset     Clear and reseed the database
            truncate  Truncate all tables
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await nestApp.close();
    process.exit(0);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
