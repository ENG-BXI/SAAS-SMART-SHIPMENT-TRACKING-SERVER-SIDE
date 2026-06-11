import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteRepository } from './note.repository';

@Injectable()
export class NoteService {
  constructor(
    private noteRepository: NoteRepository,
  ) {}
  async getAllNotes(page: number, limit: number, search?: string) {
    try {
      const notes = await this.noteRepository.getAllNotes(page, limit);
      const noteCount = await this.noteRepository.getCountOfAllNote();
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
      return deletedNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
