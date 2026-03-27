import { create } from 'zustand';

import { supportService } from '@/features/customer/services/support.service';

type SupportTicket = {
  _id: string;
  subject?: string;
  status?: string;
};

type SupportState = {
  tickets: SupportTicket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;
  submitTicket: (payload: Record<string, unknown>) => Promise<void>;
};

export const useSupportStore = create<SupportState>((set) => ({
  tickets: [],
  loading: false,
  fetchTickets: async () => {
    set({ loading: true });
    try {
      const data: any = await supportService.listTickets();
      set({ tickets: data?.data ?? data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
  submitTicket: async (payload) => {
    set({ loading: true });
    try {
      await supportService.submitTicket(payload);
      const data: any = await supportService.listTickets();
      set({ tickets: data?.data ?? data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
}));
