import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  handleCallback(txn: string): string {
    console.log(txn);
    return txn;
  }
  getHello(): string {
    return 'Hello World!';
  }
}
