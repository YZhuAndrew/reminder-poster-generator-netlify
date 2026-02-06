import { GoogleGenAI, Type } from "@google/genai";
import { PosterContent, PosterTheme } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. If you are on Vercel: 1. Go to Settings > Environment Variables. 2. Add API_KEY. 3. Go to Deployments and REDEPLOY.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes the warning text to extract metadata and footer, while keeping body content intact.
 */
export const analyzeWarningText = async (title: string, bodyHtml: string): Promise<PosterContent> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  // Extract plain text for context (simple regex to strip tags for the prompt)
  const plainBodyText = bodyHtml.replace(/<[^>]*>/g, ' ');

  const response = await ai.models.generateContent({
    model,
    contents: `You are a formatting assistant for official posters.
    
    Task: Extract metadata for a poster.
    
    Input Title: "${title}"
    Input Body (Context): "${plainBodyText.substring(0, 1000)}"
    
    Structure Requirements:
    - footer: Check if the Input Body ends with a salutation, date, or department name (e.g., "XX宣", "2024年X月"). If so, extract it. Otherwise, return empty string.
    - imagePrompt: Generate a prompt for a background texture that matches the content mood (e.g. serious, celebratory, warning). Keep it abstract and minimal.
    - suggestedColor: "#DE2910".
    
    Note: DO NOT return the body text. We will use the original HTML provided by the user.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          footer: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          suggestedColor: { type: Type.STRING },
        },
        required: ["footer", "imagePrompt", "suggestedColor"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini Text Model");
  
  const result = JSON.parse(text);

  return {
    headline: title,
    bodyText: bodyHtml, // Use original HTML to preserve formatting
    footer: result.footer,
    imagePrompt: result.imagePrompt,
    suggestedColor: result.suggestedColor
  };
};

/**
 * Generates an image based on the prompt.
 */
export const generatePosterBackground = async (prompt: string, theme: PosterTheme, textureStyle: string = 'clouds'): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  try {
    const ai = getAI();
    let styleKeywords = "traditional chinese xiangyun cloud pattern, auspicious clouds, floating aesthetics";
    
    switch (textureStyle) {
        case 'clouds':
            styleKeywords = "traditional chinese xiangyun cloud pattern, auspicious clouds, floating aesthetics";
            break;
        case 'mountains':
            styleKeywords = "chinese ink wash painting, shan shui, mountains and rivers silhouette, misty background";
            break;
        case 'bamboo':
            styleKeywords = "bamboo leaves shadow, integrity, upright bamboo stems, silhouette, nature texture";
            break;
        case 'geometric':
            styleKeywords = "modern geometric lines, abstract architectural structure, clean vectors, connected network";
            break;
        case 'paper':
            styleKeywords = "textured rice paper, xuan paper grain, rough edges, ancient scroll texture";
            break;
        case 'city':
            styleKeywords = "city skyline silhouette, modern urban background, digital connection";
            break;
        default:
            // Fallback
            styleKeywords = "official document background, subtle decorative border";
            break;
    }

    // Combine theme colors with the style
    // We emphasize the primary color as the main tone
    const colorPrompt = `${theme.name} theme colors, strictly using ${theme.primaryColor} as base and ${theme.secondaryColor} as accent`;
    
    const enhancedPrompt = `High quality background texture for a poster. 
    Style: ${styleKeywords}.
    Colors: ${colorPrompt}.
    Context: ${prompt}.
    Aesthetics: Clean gradient, no text, 8k resolution, professional, watermark free.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: enhancedPrompt }
        ]
      },
    });

    // Iterate to find the inline image data
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64Data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image gen error", error);
    // Fallback placeholder
    return `https://picsum.photos/600/800?grayscale&blur=2`;
  }
};