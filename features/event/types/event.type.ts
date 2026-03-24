export type TicketInfoPayload = {
  _id?: string;
  type: string;
  price: string;
  quantity: string;
  description: string;
  available?: string;
  ticketName?: string;
  ticketDescription?: string;
};

export type EventItem = {
  _id: string;
  ownerId?: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  physicalLocation?: string;
  layout?: string;
  imageURL?: string;
  genreId?: any;
  totalTicketCount?: number;
  status?: string;
  ticketInfo?: any[];
};

export type EventPayload = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  physicalLocation: string;
  layout: string;
  imageURL: string;
  genreId: string;
  totalTicketCount: string;
  ticketInfo?: TicketInfoPayload[];
};
