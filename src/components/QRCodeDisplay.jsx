import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ url, size = 256 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [url, size]);

  return (
    <div className="flex justify-center">
      <div className="bg-white p-4 rounded-lg">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
};

export default QRCodeDisplay;