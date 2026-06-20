import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteRepository } from './note.repository';
import { companyNoteCreatedEmail } from '../email/emails/companyNoteCreatedEmail';
import { EmailService } from '../email/email.service';
import { CompanyRepository } from '../company/company.repository';
import { GatewayService } from '../gateway/gateway.service';
import { NoteEvent } from './note.event';
import { StatisticsEvent } from '../statistics/statistics.event';

@Injectable()
export class NoteService {
  constructor(
    private noteRepository: NoteRepository,
    private emailService: EmailService,
    private companyRepository: CompanyRepository,
    private gatewayService: GatewayService,
  ) {}
  async getAllNotes(page: number, limit: number, search?: string) {
    try {
      const notes = await this.noteRepository.getAllNotes(
        page,
        limit,
        undefined,
        search,
      );
      const noteCount = await this.noteRepository.getCountOfAllNote(
        undefined,
        search,
      );
      return { notes, noteCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllNoteForCompany(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const notes = await this.noteRepository.getAllNotes(
        page,
        limit,
        companyId,
        search,
      );
      const noteCount = await this.noteRepository.getCountOfAllNote(companyId);
      return { notes, noteCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNote(note: CreateNoteDto, companyId: string) {
    try {
      const newNote = await this.noteRepository.createNote(note, companyId);
      const company = await this.companyRepository.getCompanyById(companyId);
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;

      await this.emailService.sendMail(
        companyNoteCreatedEmail(
          company?.users[0].email!,
          company?.name!,
          newNote.type,
          ClientSideDomain!,
        ),
      );
      this.gatewayService.emit(NoteEvent.ADD, newNote, companyId);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});

      return newNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editNote(note: UpdateNoteDto, noteId: string, companyId: string) {
    try {
      // check if note exists and belongs to the company
      const existingNote = await this.noteRepository.isNoteExit(
        noteId,
        companyId,
      );
      if (!existingNote) {
        throw new HttpException('Note not found', HttpStatus.BAD_REQUEST);
      }
      const updatedNote = await this.noteRepository.editNote(
        companyId,
        note,
        noteId,
      );
      this.gatewayService.emit(NoteEvent.EDIT, updatedNote, companyId);
      return updatedNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteNote(noteId: string, companyId: string) {
    try {
      // check if note exists and belongs to the company
      const existingNote = await this.noteRepository.isNoteExit(
        noteId,
        companyId,
      );
      if (!existingNote) {
        throw new HttpException('Note not found', HttpStatus.BAD_REQUEST);
      }
      const deletedNote = await this.noteRepository.deleteNote(
        noteId,
        companyId,
      );
      this.gatewayService.emit(NoteEvent.ADD, deletedNote, companyId);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return deletedNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
