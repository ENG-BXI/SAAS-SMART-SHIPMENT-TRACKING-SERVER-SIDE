import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class NoteRepository {
  constructor(private prisma: PrismaService) {}
  async getAllNotes(
    page: number,
    limit: number,
    companyId?: string,
    search?: string,
  ) {
    const notes = await this.prisma.note.findMany({
      where: {
        AND: [
          { companyId },
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
    return notes;
  }
  async getCountOfAllNote(companyId?: string, search?: string) {
    return await this.prisma.note.count({
      where: {
        AND: [
          { companyId },
          search
            ? {
                text: { contains: search, mode: 'insensitive' },
              }
            : {},
        ],
      },
    });
  }
  async createNote(note: CreateNoteDto, companyId: string) {
    return await this.prisma.note.create({
      data: {
        type: note.type,
        text: note.text,
        companyId: companyId,
      },
    });
  }
  async editNote(companyId: string, note: UpdateNoteDto, noteId: string) {
    return await this.prisma.note.update({
      where: {
        id: noteId,
        companyId: companyId,
      },
      data: {
        type: note.type,
        text: note.text,
      },
    });
  }
  async isNoteExit(noteId: string, companyId: string) {
    return await this.prisma.note.findUnique({
      where: {
        id: noteId,
        companyId: companyId,
      },
    });
  }
  async deleteNote(noteId: string, companyId: string) {
    return await this.prisma.note.delete({
      where: {
        id: noteId,
        companyId: companyId,
      },
    });
  }
}
