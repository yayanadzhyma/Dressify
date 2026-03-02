import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Outfit, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const scanClothingItem = async (base64Image: string): Promise<Partial<ClothingItem>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Analyze this clothing item. Return a JSON object with: name (descriptive), category (tops, bottoms, shoes, outerwear, accessories), color (primary color)." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          color: { type: Type.STRING }
        },
        required: ["name", "category", "color"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getWeather = async (location: string): Promise<{ temp: string; condition: string; note: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Get the current weather for ${location} from SRF Meteo (srf.ch/meteo). Return a JSON object with: temp (e.g. "18°C"), condition (e.g. "Sunny"), note (a short stylist note like "Perfect for light layers").`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temp: { type: Type.STRING },
          condition: { type: Type.STRING },
          note: { type: Type.STRING }
        },
        required: ["temp", "condition", "note"]
      }
    }
  });

  return JSON.parse(response.text || '{"temp": "18°C", "condition": "Sunny", "note": "Perfect for light layers"}');
};

export const suggestOutfits = async (
  wardrobe: ClothingItem[], 
  profile: UserProfile, 
  weather: string
): Promise<Outfit[]> => {
  const wardrobeSummary = wardrobe.map(i => `${i.name} (${i.category}, ${i.color})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this wardrobe: ${wardrobeSummary}. 
    User Profile: ${profile.style} style, ${profile.bodyType} body type. 
    Current Weather: ${weather}.
    Suggest 3 perfect outfits. Return an array of objects with: name, occasion, weatherCondition, and itemIds (matching the items provided).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            occasion: { type: Type.STRING },
            weatherCondition: { type: Type.STRING },
            itemNames: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Names of items from the wardrobe to include in this outfit"
            }
          },
          required: ["name", "occasion", "weatherCondition", "itemNames"]
        }
      }
    }
  });

  const suggestions = JSON.parse(response.text || '[]');
  
  // Map suggested names back to actual items (simplified for demo)
  return suggestions.map((s: any, idx: number) => ({
    id: `outfit-${idx}`,
    name: s.name,
    occasion: s.occasion,
    weatherCondition: s.weatherCondition,
    items: s.itemNames.map((name: string) => 
      wardrobe.find(i => i.name.toLowerCase().includes(name.toLowerCase())) || wardrobe[0]
    ).filter(Boolean)
  }));
};
