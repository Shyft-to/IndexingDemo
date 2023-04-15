import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { configuration } from './config';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    console.log(configuration().key);
    return this.appService.getHello();
  }

  @Post()
  async getCallback(@Body() parsedTxn: any): Promise<string> {
    console.log(configuration().key);
    return this.appService.handleCallback(parsedTxn);
  }
}
