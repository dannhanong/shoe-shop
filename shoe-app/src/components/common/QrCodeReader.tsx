import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QrCodeReaderProps {
  onScanSuccess: (result: string) => void;
}

const QrCodeReader: React.FC<QrCodeReaderProps> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);

  useEffect(() => {
    if (videoRef.current && !scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScanSuccess(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );
      scannerRef.current.start().catch((err) => {
        console.error('Camera start error:', err);
        setQrOn(false);
      });
    }

    return () => {
      scannerRef.current?.stop();
    };
  }, [onScanSuccess]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%' }} />
      {!qrOn && <p>Vui lòng cho phép truy cập camera để quét mã QR.</p>}
    </div>
  );
};

export default QrCodeReader;