import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeResult } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: Html5QrcodeResult) => void;
  onScanError?: (errorMessage: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScannerInitialized, setIsScannerInitialized] = useState(false);

  useEffect(() => {
    if (!isScannerInitialized) {
      scannerRef.current = new Html5QrcodeScanner(
        'reader',
        {
          videoConstraints: { facingMode: 'environment' }, // Use rear camera
          fps: 10,
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE],
        },
        false // verbose
      );

      scannerRef.current.render(onScanSuccess, onScanError);
      setIsScannerInitialized(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear html5-qrcode scanner:', error);
        });
      }
    };
  }, [onScanSuccess, onScanError, isScannerInitialized]);

  return <div id="reader" style={{ width: '100%', maxWidth: '500px' }} />;
};

export default BarcodeScanner;
