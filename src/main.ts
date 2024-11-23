import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 5000;
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

// сделать добавление комментария к событию

// при предложении времени в уведомлениях проверять сколько времени осталось до события
// // если меньше чем в кнопке - убирать ее

// сделать создание задач с приглашением людей и установкой напоминания по тексту или гс
// // парсинг текста сделать как в боте Тони
// // проверять что нет chains и listeners

// сделать чтоб можно было пересылать соощения, бот находил в них дату и время и создавал событие спрашивая только название
