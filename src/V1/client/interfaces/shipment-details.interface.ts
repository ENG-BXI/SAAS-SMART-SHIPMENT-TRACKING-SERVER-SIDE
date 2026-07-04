import { Decimal } from "@prisma/client/runtime/index-browser";

export interface IShipmentDetails {
  shipmentNumber: string;
  launchDate: Date;
  currentPointId: string | null;
  isPaused: boolean;
  isCompleted: boolean;
  way: {
    name: string;
    points: {
      id: string;
      name: string;
      lat: Decimal | null;
      lng: Decimal | null;
    }[];
  };
  driver: {
    userName: string;
    email: string;
    phoneNumber: string | null;
  } | null;
  client: {
    name: string;
    contactWays: {
      text: string;
      isPrimary: boolean;
      contactType: 'email' | 'phoneNumber';
    }[];
  }[];
  shipmentItems: {
    name: string;
    quantity: number;
    isBreakable: boolean;
  }[];
  company: {
    name: string;
    users: {
      userName: string;
      email: string;
    }[];
  };
}
