import { useEffect, useState } from "react";
import { supabase } from "@/integrations/ibb/client";
import { useDriverRole } from "./useDriverRole";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewBookingNotification {
  id: string;
  booking_number: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  vehicle_type: string;
  passenger_count: number;
}

const translations = {
  en: {
    newBooking: "New Trip Assigned!",
    from: "From",
    to: "To"
  },
  th: {
    newBooking: "ได้รับทริปใหม่!",
    from: "จาก",
    to: "ถึง"
  }
};

export const useDriverNotifications = () => {
  const { driverId, isDriver } = useDriverRole();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<NewBookingNotification[]>([]);
  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (!isDriver || !driverId) return;

    console.log("Setting up realtime notifications for driver:", driverId);

    // Subscribe to bookings table changes
    const channel = supabase
      .channel('driver-bookings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `assigned_driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log("Booking update received:", payload);
          
          const newBooking = payload.new as any;
          const oldBooking = payload.old as any;
          
          // Check if this driver was just assigned (old didn't have this driver, new does)
          if (oldBooking.assigned_driver_id !== driverId && 
              newBooking.assigned_driver_id === driverId) {
            
            const notification: NewBookingNotification = {
              id: newBooking.id,
              booking_number: newBooking.booking_number,
              pickup_location: newBooking.pickup_location,
              dropoff_location: newBooking.dropoff_location,
              pickup_datetime: newBooking.pickup_datetime,
              vehicle_type: newBooking.vehicle_type,
              passenger_count: newBooking.passenger_count
            };

            setNotifications(prev => [...prev, notification]);

            // Show toast notification
            toast.success(t.newBooking, {
              description: `${t.from}: ${newBooking.pickup_location} → ${t.to}: ${newBooking.dropoff_location}`,
              duration: 10000,
            });

            // Play notification sound
            playNotificationSound();
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [isDriver, driverId, t]);

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotification,
    clearAllNotifications,
    hasNewNotifications: notifications.length > 0
  };
};

// Simple notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};
