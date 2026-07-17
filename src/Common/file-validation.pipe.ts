// file-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('Bill Image is Require');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Image Type is Not Supported');
    }

    const maxSize = 5 * (1024 * 1024); // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image File Is Max Than 5MB');
    }

    return file;
  }
}
