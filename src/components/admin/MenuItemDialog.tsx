import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import MenuItemForm from "./MenuItemForm";

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
}

const MenuItemDialog = ({ open, onOpenChange, item }: MenuItemDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories");
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .order("name");
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      console.log("Categories fetched:", data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      console.log("Submitting values:", values);
      setIsSubmitting(true);

      const data = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        category_id: values.category_id,
        image_url: values.image_url,
        is_available: values.is_available,
      };

      console.log("Processed data:", data);

      if (item?.id) {
        const { error } = await supabase
          .from("menu_items")
          .update(data)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      console.log("Mutation successful");
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast({
        title: item ? "Item updated" : "Item created",
        description: `Menu item has been successfully ${
          item ? "updated" : "created"
        }.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to save menu item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (values: any) => {
    console.log("Form submitted with values:", values);
    mutation.mutate(values);
  };

  const defaultValues = item ? {
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category_id: item.category_id,
    image_url: item.image_url || "",
    is_available: item.is_available,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <MenuItemForm
          onSubmit={handleSubmit}
          categories={categories || []}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDialog;