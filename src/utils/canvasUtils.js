export const applyOverlay = async (imageDataUrl, logoUrl = null, eventName = '') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.onload = async () => {
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the original image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Add overlay elements
      await addOverlayElements(ctx, canvas.width, canvas.height, logoUrl, eventName);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    image.src = imageDataUrl;
  });
};

const addOverlayElements = async (ctx, width, height, logoUrl, eventName) => {
  // Add semi-transparent overlay at bottom
  const overlayHeight = 80;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight);
  
  // Add event name or default text
  const text = eventName || 'PixelBooth Pro';
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
  
  // Add Logo overlay if provided
  if (logoUrl) {
    try {
      const logoImage = await loadImageFromUrl(logoUrl);
      const logoSize = 60; // Fixed size for logo
      const logoX = 20; // Padding from left
      const logoY = height - overlayHeight / 2 - logoSize / 2; // Centered vertically in overlay
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.error("Error loading logo for overlay:", error);
    }
  }
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