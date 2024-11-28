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
import { Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type MenuItem = Tables<"menu_items">;

export const ArchivedMenuItems = () => {
  const queryClient = useQueryClient();
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const { data: archivedItems, isLoading } = useQuery({
    queryKey: ["archivedMenuItems"],
    queryFn: async () => {
      console.log("Fetching archived menu items...");
      const { data, error } = await supabase
        .from("menu_items")
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .not("deleted_at", "is", null)
        .order("name");
      
      if (error) throw error;
      return data as (MenuItem & { menu_categories: { name: string } })[];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsRestoring(id);
      const { error } = await supabase
        .from("menu_items")
        .update({ deleted_at: null })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedMenuItems"] });
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Item restored successfully");
    },
    onError: () => {
      toast.error("Failed to restore item");
    },
    onSettled: () => {
      setIsRestoring(null);
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Archived Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.menu_categories?.name}</TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell>
                  {item.deleted_at && new Date(item.deleted_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate(item.id)}
                    disabled={isRestoring === item.id}
                  >
                    {isRestoring === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {archivedItems?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No archived items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};