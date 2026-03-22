import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const getAI = () => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export async function generatePixelAvatar(base64Image: string, mimeType: string) {
  const ai = getAI();
  
  // Step 1: Analyze the image to get a detailed description for pixel art
  const analysisResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      {
        text: "Analyze this person's appearance (hair color/style, eye color, clothing, accessories, expression). Then, write a detailed prompt to generate a high-quality Q-version chibi pixel art character based on them. The style should be 'premium handheld game console pixel art' with a clean, simple background. Focus on iconic features.",
      },
    ],
  });

  const prompt = analysisResponse.text || "A cute chibi pixel art character";

  // Step 2: Generate the image using the description
  const generationResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Convert this person into a Q-version chibi pixel art character. ${prompt}. High quality, detailed pixel art, vibrant colors, clean edges, iconic chibi proportions.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of generationResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
