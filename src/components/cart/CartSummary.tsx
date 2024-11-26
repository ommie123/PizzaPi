import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface CartSummaryProps {
  total: number;
  onCheckout: () => void;
  isProcessing: boolean;
  itemCount: number;
}

export const CartSummary = ({ total, onCheckout, isProcessing, itemCount }: CartSummaryProps) => {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between mb-4">
        <span className="font-medium">Total:</span>
        <span className="font-bold">{formatCurrency(total)}</span>
      </div>
      <Button
        className="w-full bg-pizza-red hover:bg-pizza-red/90"
        disabled={itemCount === 0 || isProcessing}
        onClick={onCheckout}
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
};