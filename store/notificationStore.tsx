import React, { createContext, useContext, useState } from "react";

interface NotificationStoreValue {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
}

const NotificationContext = createContext<NotificationStoreValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationStore() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotificationStore must be used inside NotificationProvider",
    );
  return ctx;
}
