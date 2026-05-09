import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskMindAI API')
    .setDescription('REST API for TaskMindAI Document Studio MVP workflows.')
    .setVersion('0.1.0')
    .addTag('health', 'API health checks')
    .addTag('workspaces', 'Document Studio workspace management')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, swaggerDocument);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `TaskMindAI API listening on http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `TaskMindAI API docs available on http://localhost:${port}/${globalPrefix}/docs`,
  );
}

bootstrap();
