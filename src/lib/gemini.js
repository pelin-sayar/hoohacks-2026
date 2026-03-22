//use this when out of gemini queries
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

//use this for real API calls to Gemini when there are enough queries

/*
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeImage = async (base64Image) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageData = base64Image.split(",")[1];

  const prompt = `You are Picto-pal, a photography mentor who helps people take better pictures.  
1. If the composition, lighting, and framing look good (you can be a bit lenient), say: "Good framing, lighting, and composition!"
2. Otherwise, give ONE short instruction (max 10 words) to improve it. 
Use technical terms like 'Rule of Thirds', 'Lead Room', or 'Rim Light'.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageData, mimeType: "image/jpeg" } },
  ]);

  return result.response.text();
};
*/