import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpException,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import type { Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';

@Controller('note')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  async getAllNotes(
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ): Promise<IResponseWithPagination> {
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const notes = await this.noteService.getAllNotes(page, limit, search);
    const totalPages = Math.ceil(notes.noteCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: notes.notes,
        totalCount: notes.noteCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Notes fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Get('company')
  async getAllNotesForCompany(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ): Promise<IResponseWithPagination> {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const notes = await this.noteService.getAllNoteForCompany(
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(notes.noteCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: notes.notes,
        totalCount: notes.noteCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Notes fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Post()
  async createNote(
    @Body(new ValidationPipe()) note: CreateNoteDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const newNote = await this.noteService.createNote(note, req.user.companyId);
    return {
      data: newNote,
      message: 'Note created successfully',
      status: HttpStatus.OK,
    };
  }
  @Put(':id')
  async editNote(
    @Body(new ValidationPipe()) note: UpdateNoteDto,
    @Param('id') noteId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const updatedNote = await this.noteService.editNote(
      note,
      noteId,
      req.user.companyId,
    );
    return {
      data: updatedNote,
      message: 'Note updated successfully',
      status: HttpStatus.OK,
    };
  }
  @Delete(':id')
  async deleteNote(@Param('id') noteId: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const deletedNote = await this.noteService.deleteNote(
      noteId,
      req.user.companyId,
    );
    return {
      data: deletedNote,
      message: 'Note deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
