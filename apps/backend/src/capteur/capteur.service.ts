import { URL } from 'url';
if (typeof global !== 'undefined' && !global.URL) {
  (global as any).URL = URL;
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {Warp10, TimeUnits} from '@senx/warp10';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(duration);


@Injectable()
export class CapteurService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.lot.findMany();
  }
  findCapteursPiece(pieceId :string){
    return this.prisma.intervention.findMany({where : {idpiece : pieceId}});
  }
  async getRawData(pieceId: string, typeData: string){
    const warp10 = new Warp10({
      endpoint:"https://kwh50-warp10.alkante.com/api/v0",
      timeUnit:TimeUnits.US,
      debug:true,
      silent:true,
      timeout:5000
    });
    const readToken = "lRZMrj_K5dVWo0D_nR7n8j7r3GSZHtSLLBjKGcs1NVT.QbM9KbBtG_GI4UItKHGpcGYOkKDS1XZJEUQTA68JWgopPwpEptIsYCCn39BPYsUNj_3KEV2HZOzTPYrymb9ZmNCfXWQZBbfak0vxPDpSDF";

      const data = await warp10.fetch(
        readToken, 
        `~kwh50.confort.${typeData}.*`,
        {devEUI : pieceId},
        dayjs().toISOString(),
        dayjs().subtract(12, 'hours').utc().toISOString(),
        "json"
      )
      
      if(data.result){
        return data.result;

      }
      else{
        return null;
      }
   
    }

  }