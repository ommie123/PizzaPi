import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playOrderNotification, playWaiterNotification } from "@/utils/notifications";

export const NotificationListener = () => {
  useEffect(() => {
    console.log("Setting up admin notifications...");

    // Listen for new orders
    const ordersSubscription = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          toast.info("New Order Received!", {
            description: `Table ${payload.new.table_number} placed a new order.`
          });
          playOrderNotification();
        }
      )
      .subscribe();

    // Listen for waiter calls
    const tablesSubscription = supabase
      .channel('tables_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tables',
          filter: 'status=eq.needs_service'
        },
        (payload) => {
          console.log('Waiter called:', payload);
          toast.info("Waiter Needed!", {
            description: `Table ${payload.new.number} needs assistance.`
          });
          playWaiterNotification();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up admin notifications...");
      ordersSubscription.unsubscribe();
      tablesSubscription.unsubscribe();
    };
  }, []);

  return null;
};