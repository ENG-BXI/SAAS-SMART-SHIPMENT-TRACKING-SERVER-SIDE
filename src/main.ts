import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './Common/interceptors/response.interceptor';
import { ErrorsInterceptor } from './Common/interceptors/errors.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('🚀SAAS Smart Shipment Tracking - API Engine')
    .setDescription(
      '### SAAS Smart Shipment Tracking System\n' +
        'This API serves as the backbone for the Smart Shipment Tracking SAAS platform. ' +
        'It handles multi-tenant company management, subscription tracking, and core logistics operations.\n\n' +
        '**Guides:**\n' +
        '- Use the `Bearer` token for authorized requests.\n' +
        '- All endpoints are versioned (default: v1).',
    )
    .setVersion('1.0')
    .addTag('Company', 'Manage company accounts, profiles, and authentication.')
    .addTag('Subscription', 'Handle plan assignments and billing cycles.')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name must match the one used in @ApiBearerAuth()
    )
    .build();
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
      customSiteTitle: 'SAAS Smart Shipment API Documentation',
    });
  }

  app.useGlobalInterceptors(new ErrorsInterceptor(), new ResponseInterceptor());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
