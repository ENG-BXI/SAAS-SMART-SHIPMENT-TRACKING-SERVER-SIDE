import { contactType } from 'generated/prisma/enums';

export interface IContactWay {
  text: string;
  isPrimary: boolean;
  contactType: contactType;
}
