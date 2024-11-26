import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: any;
}

const QRCodeDialog = ({ open, onOpenChange, table }: QRCodeDialogProps) => {
  if (!table) return null;

  // Generate the absolute URL for the menu page with table parameter
  const orderUrl = `${window.location.origin}/menu?table=${table.number}`;
  console.log("Generated QR code URL:", orderUrl);

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Create download link
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `table-${table.number}-qr.png`;
      link.href = pngUrl;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table {table.number} QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG
            id="qr-code-svg"
            value={orderUrl}
            size={256}
            level="H"
            includeMargin
          />
          <p className="text-sm text-center text-gray-500">
            Scan this QR code to access the menu for Table {table.number}
          </p>
          <Button onClick={handleDownload}>
            Download QR Code
          </Button>
          <div className="text-xs text-gray-400 text-center">
            URL: {orderUrl}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;