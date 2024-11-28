import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Archive } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type MenuItem = Tables<"menu_items">;

interface ActiveMenuItemsProps {
  onEdit: (item: MenuItem) => void;
}

export const ActiveMenuItems = ({ onEdit }: ActiveMenuItemsProps) => {
  const queryClient = useQueryClient();
  const [isArchiving, setIsArchiving] = useState<string | null>(null);

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["adminMenuItems"],
    queryFn: async () => {
      console.log("Fetching active menu items...");
      const { data, error } = await supabase
        .from("menu_items")
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .is("deleted_at", null)
        .order("name");
      
      if (error) throw error;
      return data as (MenuItem & { menu_categories: { name: string } })[];
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsArchiving(id);
      const { error } = await supabase
        .from("menu_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Item archived successfully");
    },
    onError: () => {
      toast.error("Failed to archive item");
    },
    onSettled: () => {
      setIsArchiving(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.menu_categories?.name}</TableCell>
              <TableCell>{formatCurrency(item.price)}</TableCell>
              <TableCell>
                {item.is_available ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => archiveMutation.mutate(item.id)}
                  disabled={isArchiving === item.id}
                >
                  {isArchiving === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {menuItems?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No menu items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};