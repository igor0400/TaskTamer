import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 5000;
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

// поменять везде где просто кнопка меню на «Назад» (поменять в EntServices тоже)

// поменять все текста в TaTa и EntServices

// доделать уведомления о сбытиях

// при обновлении часового пояса сдвигать все время у задач

// сделать отметку сегодняшнего дня с учетом часового пояса
// // сделать общую функцию для получаения текушего времени с учетом TZ
