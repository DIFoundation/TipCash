'use client';

import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRef } from 'react';

interface QRCodeProps {
  value: string;
  label?: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  showDownload?: boolean;
}

export function QRCodeDisplay({
  value,
  label,
  size = 256,
  level = 'H',
  includeMargin = true,
  showDownload = true,
}: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `tipcash-qr-${Date.now()}.png`;
        link.click();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-lg shadow-md"
      >
        <QRCode
          value={value}
          size={size}
          level={level}
          marginSize={includeMargin ? 4 : 0}
          
        />
      </div>
      
      {label && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {label}
        </p>
      )}
      
      {showDownload && (
        <Button
          onClick={downloadQRCode}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      )}
    </div>
  );
}
