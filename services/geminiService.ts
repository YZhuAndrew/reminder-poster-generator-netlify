import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { PosterContent } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the warning text to extract metadata and footer, while keeping body content intact.
 */
export const analyzeWarningText = async (title: string, bodyHtml: string): Promise<PosterContent> => {
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
    - imagePrompt: Generate a prompt for a background texture: "Chinese official aesthetic, rich red/gold gradient, subtle xiangyun patterns, minimal, solemn".
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
export const generatePosterBackground = async (prompt: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  try {
    // Force specific style keywords for the Red/Gold background
    const enhancedPrompt = `High quality background texture, ${prompt}, red and gold theme, chinese traditional pattern, communist party style aesthetic, clean gradient, no text, 8k resolution`;
    
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