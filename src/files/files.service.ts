import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  async createFileByUrl(fileUrl: URL, format: string = 'jpg') {
    const filePath = await (
      await fetch(`${process.env.BACKEND_URL}/files`, {
        method: 'POST',
        body: JSON.stringify({
          fileUrl: fileUrl.href,
          format,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).text();

    return filePath;
  }

  async deleteFile(src: string) {
    try {
      await fetch(`${process.env.BACKEND_URL}/files`, {
        method: 'DELETE',
        body: JSON.stringify({
          filePath: src,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return 'Файл удален';
    } catch (error) {
      console.error(`Ошибка удаления файла: ${JSON.stringify(error)}`);
    }
  }
}
