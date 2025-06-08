import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { socket } from "@/api/socket";
import { useShowNotificationWithImage } from "@/hooks/useLocalNotifications";

// Define the type for the context value
interface SocketContextType {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  clearNotifications: () => void;
  openPopover: any;
  setOpenPopover: (val: any) => void;
  openNotificationDialog: any;
  setOpenNotificationDialog: (val: any) => void;
  notificationAction: any;
  setNotificationAction: (val: any) => void;
  totalUnRead: number;
  handleOpenPopover: (event: any) => void;
  newNotifications: any[];
  setNewNotifications: (val: any[]) => void;
  data: Record<string, any[]>;
  setData: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [data, setData] = useState<Record<string, any[]>>({});
  const [openPopover, setOpenPopover] = useState(null);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(null);
  const [notificationAction, setNotificationAction] = useState(null);
  const [newNotifications, setNewNotifications] = useState<any[]>([]);

  // const showNotificationWithImage = useShowNotificationWithImage();

  // Calculate unread notifications
  const totalUnRead = notifications.filter(
    (item) => item?.seen === false
  ).length;

  const handleOpenPopover = (event: any) => {
    setOpenPopover(event.currentTarget);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setNewNotifications([]);
    setData({});
  };

  useEffect(() => {
    // Generic handler for module-based events
    const handleSocketData = (moduleName: string) => (payload: any) => {
      setNotifications((prev) => [payload, ...prev]);
      setNewNotifications((prev) => [payload, ...prev]);
      setData((prev) => ({
        ...prev,
        [moduleName]: [payload, ...(prev[moduleName] || [])],
      }));
      // showNotificationWithImage({
      //   title: payload.title || `New ${moduleName} Notification`,
      //   body: payload.body || payload.message || "You have a new notification.",
      //   data: payload,
      // });
    };

    // Add all relevant socket event listeners
    const moduleEvents = [
      "sellerBids",
      "buyerBids",
      "order",
      "bidding",
      "new_notification",
    ];
    const handlers: Record<string, (payload: any) => void> = {};
    moduleEvents.forEach((event) => {
      handlers[event] = handleSocketData(event);
      socket.on(event, handlers[event]);
    });

    return () => {
      moduleEvents.forEach((event) => {
        socket.off(event, handlers[event]);
      });
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        notifications,
        setNotifications,
        clearNotifications,
        openPopover,
        setOpenPopover,
        openNotificationDialog,
        setOpenNotificationDialog,
        notificationAction,
        setNotificationAction,
        totalUnRead,
        handleOpenPopover,
        newNotifications,
        setNewNotifications,
        data,
        setData,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the SocketContext
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
