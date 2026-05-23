import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './infrastructure/core/http/filters/http-exception.filter';
import { SuccessResponseInterceptor } from './infrastructure/core/http/interceptors/success-response.interceptor';

export function initializeApp(app: INestApplication): void {
  const expressInstance: Express = app
    .getHttpAdapter()
    .getInstance() as Express;

  expressInstance.disable('x-powered-by');

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(app.get<Logger>(Logger)));

  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SAKTI.Ai API')
    .setDescription('Backend API untuk SAKTI.Ai - Platform Talent Mapping')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
