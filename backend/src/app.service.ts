import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 Hackathon Backend API is running! Connected to SQLite database.';
  }
}
