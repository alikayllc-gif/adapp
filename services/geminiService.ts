
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrendingProduct } from "../types";

export const findTrendingProducts = async (): Promise<TrendingProduct[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Search for the top 8 currently trending products on TikTok (Viral in the last 30 days). 
  Return a structured JSON list of these 8 products.
  For each product, include:
  1. name: The product name.
  2. description: A 1-sentence description.
  3. trendReason: Why it's viral right now.
  4. adHook: A catchy first-line hook for a 60-second video ad.
  5. visualPrompt: A detailed visual description of a high-energy, vertical video ad for this product (9:16 aspect ratio).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            trendReason: { type: Type.STRING },
            adHook: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["name", "description", "trendReason", "adHook", "visualPrompt"]
        }
      }
    }
  });

  const rawJson = response.text;
  const products = JSON.parse(rawJson);
  return products.map((p: any, idx: number) => ({
    ...p,
    id: `prod-${idx}`
  }));
};

export const generateAdVideo = async (product: TrendingProduct, onProgress: (progress: number) => void): Promise<string> => {
  // We use a fresh AI instance to ensure we get the latest selected key (especially if user just selected one)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A professional, high-energy TikTok video ad for ${product.name}. ${product.visualPrompt}. Vibrant colors, cinematic lighting, 4k, trending style.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  let pollCount = 0;
  while (!operation.done) {
    // Artificial progress for UI purposes
    pollCount++;
    const simulatedProgress = Math.min(95, pollCount * 5);
    onProgress(simulatedProgress);

    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");

  // Fetch the actual MP4 bytes using the API key as required by the docs
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) throw new Error("Failed to download video bytes");

  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};
