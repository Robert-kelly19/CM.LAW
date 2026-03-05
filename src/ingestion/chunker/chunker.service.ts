import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkerService {
  splitArticles(text: string) {
    const articles = text.split(/Article\s+\d+/i);

    return articles.map((a) => a.trim()).filter((a) => a.length > 100);
  }
}
