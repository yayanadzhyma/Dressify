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
          { text: "Analyze this clothing item. Return a JSON object with: name (descriptive), category (tops, bottoms, dresses, jumpsuits, shoes, outerwear, accessories), color (primary color)." }
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

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (retries > 0 && (errorMsg.includes('429') || errorMsg.includes('503') || errorMsg.includes('RESOURCE_EXHAUSTED'))) {
      console.log(`Retrying API call... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const getWeather = async (location: string): Promise<{ temp: string; condition: string; note: string }> => {
  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Get the current weather for ${location} based on Google Weather information. Return a JSON object with: temp (e.g. "18°C"), condition (e.g. "Sunny"), note (a short stylist note like "Perfect for light layers").`,
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
    });
  } catch (error) {
    console.warn("Weather API failed after retries, using fallback data:", error);
    return { temp: "18°C", condition: "Sunny", note: "Perfect for light layers (Fallback Data)" };
  }
};

export const suggestOutfits = async (
  wardrobe: ClothingItem[], 
  profile: UserProfile, 
  weather: string
): Promise<Outfit[]> => {
  const wardrobeSummary = wardrobe.map(i => `${i.name} (${i.category}, ${i.color})`).join(', ');
  
  try {
    return await withRetry(async () => {
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
      
      return suggestions.map((s: any, idx: number) => ({
        id: `outfit-${idx}`,
        name: s.name,
        occasion: s.occasion,
        weatherCondition: s.weatherCondition,
        items: s.itemNames.map((name: string) => 
          wardrobe.find(i => i.name.toLowerCase().includes(name.toLowerCase())) || wardrobe[0]
        ).filter(Boolean)
      }));
    });
  } catch (error) {
    console.warn("Outfit Suggestion API failed after retries, using fallback data:", error);
    // Fallback logic: just create some basic outfits from the wardrobe
    if (wardrobe.length === 0) return [];
    
    return [
      {
        id: 'fallback-1',
        name: 'Casual Comfort',
        occasion: 'Everyday',
        weatherCondition: weather,
        items: [wardrobe[0], wardrobe[1]].filter(Boolean)
      },
      {
        id: 'fallback-2',
        name: 'Smart Casual',
        occasion: 'Work / Meeting',
        weatherCondition: weather,
        items: [wardrobe[0], wardrobe[2] || wardrobe[0]].filter(Boolean)
      }
    ];
  }
};

export const analyzeProductImageCompatibility = async (
  base64Image: string,
  wardrobe: ClothingItem[]
): Promise<{ itemName: string; combinations: string[] }> => {
  if (wardrobe.length === 0) return { itemName: "Item", combinations: ["Your wardrobe is empty. Add some items to check compatibility!"] };
  
  const wardrobeSummary = wardrobe.map(i => `${i.name} (${i.category}, ${i.color})`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            { text: `Identify this clothing item and then, based on this wardrobe: ${wardrobeSummary}, suggest exactly 5 ways to style it using ONLY the items from the wardrobe. 
            Return a JSON object with: 
            itemName: "A short name for this item",
            combinations: ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            combinations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["itemName", "combinations"]
        }
      }
    });

    return JSON.parse(response.text || '{"itemName": "Item", "combinations": []}');
  } catch (error) {
    console.warn("Image compatibility analysis failed:", error);
    return {
      itemName: "Detected Item",
      combinations: [
        "Style it with your favorite basic pieces from the wardrobe.",
        "Looks like a great match for your collection!",
        "Try pairing with contrasting colors from your closet.",
        "Versatile piece that complements your style.",
        "Check your wardrobe for compatible items."
      ]
    };
  }
};
