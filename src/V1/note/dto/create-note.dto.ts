import { NoteType } from 'generated/prisma/enums';
import { IsEnum, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsEnum(NoteType, { message: 'Type must be a valid note type' })
  type: NoteType;
  @IsString({ message: 'Text must be a string' })
  text: string;
}
