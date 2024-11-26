import { useEffect } from "react";
import { useTableManagement } from "@/hooks/useTableManagement";
import { toast } from "sonner";

interface TableSessionProps {
  tableNumber: number;
}

export const TableSession = ({ tableNumber }: TableSessionProps) => {
  const { tableStatus, subscribeToTableUpdates } = useTableManagement(tableNumber);

  useEffect(() => {
    const unsubscribe = subscribeToTableUpdates();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (tableStatus?.status === "paid") {
      toast.info("Table session ended", {
        description: "This table's session has ended. Please scan the QR code again for a new session."
      });
    }
  }, [tableStatus]);

  return null; // This is a logic-only component
};