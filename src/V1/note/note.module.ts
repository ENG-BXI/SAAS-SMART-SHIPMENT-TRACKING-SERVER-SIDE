import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { NoteRepository } from './note.repository';
import { EmailModule } from '../email/email.module';
import { CompanyRepository } from '../company/company.repository';

@Module({
  controllers: [NoteController],
  providers: [NoteService, NoteRepository, CompanyRepository],
  imports: [EmailModule],
})
export class NoteModule {}
