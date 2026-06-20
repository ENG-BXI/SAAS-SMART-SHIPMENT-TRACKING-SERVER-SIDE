import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { NoteRepository } from './note.repository';
import { EmailModule } from '../email/email.module';
import { CompanyRepository } from '../company/company.repository';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  controllers: [NoteController],
  providers: [NoteService, NoteRepository, CompanyRepository],
  imports: [EmailModule,GatewayModule],
})
export class NoteModule {}
