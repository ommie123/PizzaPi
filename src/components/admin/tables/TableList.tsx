import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "lucide-react";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import TableDialog from "./TableDialog";
import QRCodeDialog from "./QRCodeDialog";
import { toast } from "sonner";

const TableList = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const { data: tables, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .order("number");
      
      if (error) {
        console.error("Error fetching tables:", error);
        throw error;
      }
      return data;
    },
  });

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("table_number")
        .eq("id", tableId)
        .single();

      if (orderError) throw orderError;

      if (!order?.table_number) {
        toast.error("Table number not found");
        return;
      }

      // First update the order status
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", tableId);

      if (updateOrderError) throw updateOrderError;

      // If the order is being marked as paid, update the table status to available
      if (newStatus === "paid" && order.table_number) {
        const { error: tableError } = await supabase
          .from("tables")
          .update({ status: "available" })
          .eq("number", order.table_number);

        if (tableError) throw tableError;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-500",
      occupied: "bg-red-500",
      reserved: "bg-yellow-500",
      inactive: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tables</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Table className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </div>

      <UITable>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables?.map((table) => (
            <TableRow key={table.id}>
              <TableCell>{table.number}</TableCell>
              <TableCell>{table.name || `-`}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(table.status || '')}>
                  {table.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTable(table);
                      setIsQRDialogOpen(true);
                    }}
                  >
                    View QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (table.id) {
                        handleStatusChange(
                          table.id,
                          table.status === "available" ? "occupied" : "available"
                        );
                      }
                    }}
                  >
                    Toggle Status
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </UITable>

      <TableDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />

      <QRCodeDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        table={selectedTable}
      />
    </div>
  );
};

export default TableList;