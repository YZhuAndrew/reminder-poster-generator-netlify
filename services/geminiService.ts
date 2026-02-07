import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PosterContent, PosterTheme } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  // Vite replaces process.env.API_KEY with the actual string during build
  const apiKey = process.env.API_KEY;
  
  // Check for various "missing" states: undefined, null, empty string, or literal "undefined" string
  if (!apiKey || apiKey === '""' || apiKey === "undefined" || apiKey.length < 5) {
    throw new Error("API Key 配置缺失。请在 Vercel 设置中添加 API_KEY 环境变量并重新部署。");
  }
  return new GoogleGenAI({ apiKey });
};

// Timeout helper: forces a promise to reject after X milliseconds
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);

        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
};

/**
 * Analyzes the warning text to extract metadata and footer, while keeping body content intact.
 */
export const analyzeWarningText = async (title: string, bodyHtml: string): Promise<PosterContent> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const plainBodyText = bodyHtml.replace(/<[^>]*>/g, ' ');

  try {
      const response = await withTimeout<GenerateContentResponse>(
          ai.models.generateContent({
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
          }),
          30000, // 30 seconds timeout for text generation
          "请求超时。请检查网络连接（如是否开启 VPN）或稍后重试。"
      );

      const text = response.text;
      if (!text) throw new Error("AI 返回内容为空，请重试。");
      
      const result = JSON.parse(text);

      return {
        headline: title,
        bodyText: bodyHtml, 
        footer: result.footer,
        imagePrompt: result.imagePrompt,
        suggestedColor: result.suggestedColor
      };
  } catch (error: any) {
      console.error("Text Gen Error:", error);
      throw new Error(error.message || "生成失败，请检查网络或 API Key");
  }
};

/**
 * Generates an image based on the prompt.
 */
export const generatePosterBackground = async (prompt: string, theme: PosterTheme, textureStyle: string = 'clouds'): Promise<string | null> => {
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
            styleKeywords = "official document background, subtle decorative border";
            break;
    }

    const colorPrompt = `${theme.name} theme colors, strictly using ${theme.primaryColor} as base and ${theme.secondaryColor} as accent`;
    
    const enhancedPrompt = `High quality background texture for a poster. 
    Style: ${styleKeywords}.
    Colors: ${colorPrompt}.
    Context: ${prompt}.
    Aesthetics: Clean gradient, no text, 8k resolution, professional, watermark free.`;
    
    const response = await withTimeout<GenerateContentResponse>(
        ai.models.generateContent({
          model,
          contents: {
            parts: [
              { text: enhancedPrompt }
            ]
          },
        }),
        45000, // 45 seconds timeout for image generation (slower)
        "绘图请求超时。请稍后重试。"
    );

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

  } catch (error: any) {
    // Graceful handling of Quota limits (429)
    if (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
         console.warn("Image generation skipped due to API quota limits (429). Using CSS fallback.");
         // Throw specific error for UI to handle if needed, or return null to fallback silently
         return null; 
    }
    
    // Allow UI to show specific timeout messages
    if (error.message.includes('超时')) {
        throw error;
    }

    console.error("Image gen error", error);
    return null;
  }
};