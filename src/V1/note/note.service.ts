import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}
  async getAllNotes(page: number, limit: number, search?: string) {
    try {
      const notes = await this.prisma.note.findMany({
        where: {
          AND: [
            search
              ? {
                  text: { contains: search, mode: 'insensitive' },
                }
              : {},
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          text: true,
          createdAt: true,
        },
      });
      const noteCount = await this.prisma.note.count({
        where: {
          AND: [
            search
              ? {
                  text: { contains: search, mode: 'insensitive' },
                }
              : {},
          ],
        },
      });
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
      const notes = await this.prisma.note.findMany({
        where: {
          AND: [
            { companyId: companyId },
            search
              ? {
                  text: { contains: search, mode: 'insensitive' },
                }
              : {},
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          text: true,
          createdAt: true,
        },
      });
      const noteCount = await this.prisma.note.count({
        where: {
          AND: [
            { companyId: companyId },
            search
              ? {
                  text: { contains: search, mode: 'insensitive' },
                }
              : {},
          ],
        },
      });
      return { notes, noteCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNote(note: CreateNoteDto, companyId: string) {
    try {
      const newNote = await this.prisma.note.create({
        data: {
          type: note.type,
          text: note.text,
          companyId: companyId,
        },
      });
      return newNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editNote(note: UpdateNoteDto, noteId: string, companyId: string) {
    try {
      // check if note exists and belongs to the company
      const existingNote = await this.prisma.note.findUnique({
        where: {
          id: noteId,
          companyId: companyId,
        },
      });
      if (!existingNote) {
        throw new HttpException('Note not found', HttpStatus.BAD_REQUEST);
      }
      const updatedNote = await this.prisma.note.update({
        where: {
          id: noteId,
          companyId: companyId,
        },
        data: {
          type: note.type,
          text: note.text,
        },
      });
      return updatedNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteNote(noteId: string, companyId: string) {
    try {
      // check if note exists and belongs to the company
      const existingNote = await this.prisma.note.findUnique({
        where: {
          id: noteId,
          companyId: companyId,
        },
      });
      if (!existingNote) {
        throw new HttpException('Note not found', HttpStatus.BAD_REQUEST);
      }
      const deletedNote = await this.prisma.note.delete({
        where: {
          id: noteId,
          companyId: companyId,
        },
      });
      return deletedNote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
