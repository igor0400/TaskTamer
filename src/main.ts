import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 5000;
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

// сделать создание задач с приглашением людей и установкой напоминания по тексту или гс
// // парсинг текста сделать как в боте Тони
// // проверять что нет chains и listeners

// сделать возможно добавить группу к событию
// // при добавлени группы и добавления бота в нее присылать сообщениее с сылкой на приглашение
// // сделать возможность выбора времени совместно или только чтоб владелец задавал
