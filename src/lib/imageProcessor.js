/**
 * imageProcessor.js
 * * This module handles local Computer Vision tasks using the HTML5 Canvas API.
 * It calculates the perceptual brightness of an image and adjusts the 
 * Exposure Value (EV) based on a Virtual ISO setting.
 */

export const calculateLocalStats = (base64Image, iso = 100) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      let totalLuma = 0;

      /**
       * The Luminance Calculation
       * Loops through the pixels and applies the formula:
       * Luma = 0.299*R + 0.587*G + 0.114*B
       * Uses the Perceptual Weighting formula because human eyes are most 
       * sensitive to green and least sensitive to blue.
       */
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // standard Rec. 601 luma coefficients
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuma += luma;
      }

      //Calculates Average Brightness (0 to 255)
      const avgLuma = totalLuma / (canvas.width * canvas.height);
      
      //Converts to a percentage (0 to 100)
      const baseBrightness = (avgLuma / 255) * 100;

      /**
       * The ISO Math (The Exposure Triangle)
       * In photography, doubling ISO adds 1 "Stop" of light.
       * Adjustment = log2(currentISO / baselineISO)
       * At ISO 100: log2(1) = 0 stops
       * At ISO 200: log2(2) = +1 stop
       * At ISO 400: log2(4) = +2 stops
       */
      const isoAdjustment = Math.log2(iso / 100);
      
      resolve({ 
        baseBrightness, 
        isoAdjustment,
        avgLuma
      });
    };

    img.onerror = (err) => reject(err);
    
    //Set the source to the base64 string provided by the camera
    img.src = base64Image;
  });
};