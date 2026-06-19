import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway';
@Injectable()
export class GatewayService {
  constructor(private appGateway: AppGateway) {}
  emit(event: string, data: any, companyId?: string) {
    console.log('====================================');
    console.log(companyId, event, data);
    console.log('====================================');
    // if (companyId)
    //   this.appGateway.server.to(`company:${companyId}`).emit(event, data);
    // else this.appGateway.server.emit(event, data);
    this.appGateway.server.emit(event, data);
  }
}
