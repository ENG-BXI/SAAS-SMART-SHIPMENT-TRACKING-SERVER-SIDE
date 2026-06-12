export interface IAddShipmentItem {
  clientId: string;
  name: string;
  quantity: number;
  isBreakable: boolean;
  shipmentId: string;
}
export interface IEditShipmentItem {
  name?: string;
  quantity?: number;
  isBreakable?: boolean;
}
