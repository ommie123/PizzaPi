import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTableManagement = (tableNumber?: number) => {
  const queryClient = useQueryClient();

  // Subscribe to real-time table updates
  const subscribeToTableUpdates = () => {
    const subscription = supabase
      .channel('table_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  // Get table status
  const { data: tableStatus } = useQuery({
    queryKey: ['table-status', tableNumber],
    queryFn: async () => {
      if (!tableNumber) return null;
      
      console.log('Fetching status for table:', tableNumber);
      const { data, error } = await supabase
        .from('tables')
        .select('status')
        .eq('number', tableNumber)
        .single();

      if (error) {
        console.error('Error fetching table status:', error);
        throw error;
      }

      return data;
    },
    enabled: !!tableNumber,
  });

  // Reset table session
  const resetTableSession = useMutation({
    mutationFn: async (tableNumber: number) => {
      console.log('Resetting session for table:', tableNumber);
      
      // Update table status to available
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('number', tableNumber);

      if (tableError) throw tableError;

      // Clear any pending orders for this table
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('table_number', tableNumber)
        .eq('status', 'pending');

      if (ordersError) throw ordersError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['table-status'] });
      toast.success('Table session reset successfully');
    },
    onError: (error) => {
      console.error('Error resetting table session:', error);
      toast.error('Failed to reset table session');
    },
  });

  return {
    tableStatus,
    resetTableSession,
    subscribeToTableUpdates,
  };
};