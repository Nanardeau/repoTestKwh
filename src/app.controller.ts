import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post(':param')
  create(@Param('param') parametre: string) {
    //return "cc";
    return this.appService.create(parametre);
  }
}
