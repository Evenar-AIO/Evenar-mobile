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
  genreId?: string;
  totalTicketCount?: number;
  status?: string;
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
};
