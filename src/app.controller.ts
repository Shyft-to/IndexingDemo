import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { configuration } from './config';
import { StartCallbackDto } from './dto';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    console.log(configuration().API_KEY);
    return this.appService.getHello();
  }

  @Post('/setup')
  async setup(@Body() data: StartCallbackDto): Promise<any> {
    await this.appService.setup(data);
    return 'setup complete';
  }

  @Post('/stop')
  async stopCallback(): Promise<any> {
    const resp = await this.appService.stopCallback();
    return resp;
  }

  @Post('/event_reception')
  mintHandler(@Body() data: any): string {
    this.appService.handleEvent(data);
    console.log(data);
    return 'nft minted on cm';
  }

  @Post('/startMint')
  async startMint(@Body() data: any): Promise<string> {
    this.appService.startMinting();
    return 'nft minted on cm';
  }

  @Get('/snapshot')
  getSnapshot(): any {
    return this.appService.getsnapshot();
  }
}
