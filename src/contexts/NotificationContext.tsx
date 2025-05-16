import React, { createContext, useState, useContext } from "react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 5000);
    console.log(
      `notification ${isVisible ? "visible" : ""} ${notification?.type}`
    );
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div //each notification class name like visible and notification type hass a colour in styles.css
        className={`notification ${isVisible ? "visible" : ""} ${
          notification?.type
        }`}
      >
        {notification?.message}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
