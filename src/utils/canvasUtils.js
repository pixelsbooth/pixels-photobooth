export const applyOverlay = async (imageDataUrl, logoUrl = null, eventName = '') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the original image
      ctx.drawImage(image, 0, 0);
      
      // Add overlay elements
      addOverlayElements(ctx, canvas.width, canvas.height, logoUrl, eventName);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    image.src = imageDataUrl;
  });
};

const addOverlayElements = (ctx, width, height, logoUrl, eventName) => {
  // Add semi-transparent overlay at bottom
  const overlayHeight = 80;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight);
  
  // Add event name or default text
  const text = eventName || 'PixelBooth Lite';
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height - overlayHeight / 2);
  
  // Add timestamp
  const timestamp = new Date().toLocaleString();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(timestamp, width - 20, height - 10);
  
  // Note: Logo overlay would require loading the logo image first
  // This is a simplified version for the MVP
};

export const loadImageFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};