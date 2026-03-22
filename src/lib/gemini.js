//use this when out of gemini queries
/*
const mockInsights = [
  "COMPOSITION: RULE OF THIRDS DETECTED. OPTIMAL.",
  "LIGHTING: HIGH CONTRAST ANALYZED. ADJUST ISO -200.",
  "SUBJECT: CENTERED. GOOD FRAMING.",
  "GEOMETRY: GOOD SYMMETRY!.",
  "EXPOSURE: YOUR EXPOSURE IS TOO BRIGHT, DECREASE ISO."
];

export async function analyzeImage(base64Image) {
  //simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  //return a random insight
  const randomAdvice = mockInsights[Math.floor(Math.random() * mockInsights.length)];
  
  return {
    advice: randomAdvice
  };
}
*/

//use this for real API calls to Gemini when there are enough queries


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeImage = async (base64Image) => {
  try {
    // 1. Fixed Model Name to the stable Free Tier version
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Ensure we only send the raw data (removing the data:image/jpeg;base64, prefix)
    const imageData = base64Image.includes(",") 
      ? base64Image.split(",")[1] 
      : base64Image;

  const prompt = `You are Picto-pal, a photography mentor who helps people take better pictures.  
1. If the composition, lighting, and framing look good (you can be a bit lenient), say: "Good framing, lighting, and composition!"
2. Otherwise, give ONE short instruction (max 10 words) to improve it. 
Use technical terms like 'Rule of Thirds', 'Lead Room', or 'Rim Light'.`;

  const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // 3. Return an OBJECT so App.jsx doesn't crash
    return {
      advice: text || "SYSTEM_IDLE"
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if the API is down or quota is hit
    return {
      advice: "SIGNAL_INTERFERENCE_RETRY"
    };
  }
};
