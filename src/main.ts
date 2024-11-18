import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 5000;
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

// поменять везде где просто кнопка меню на «Назад» (поменять в EntServices тоже)

// поменять все текста и кнопки в TaTa и EntServices

// доделать уведомления о сбытиях

// при обновлении часового пояса сдвигать все время у задач и уведомлений

// сделать отметку сегодняшнего дня с учетом часового пояса
// // сделать общую функцию для получаения текушего времени с учетом TZ

// сделать создание задач с приглашением людей и установкой напоминания по тексту или гс
// // парсинг текста сделать как в боте Тони
// // проверять что нет chains и listeners
