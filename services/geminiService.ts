import { PosterContent, PosterTheme } from "../types";

/**
 * 本地逻辑替代 AI 分析
 * 纯前端处理，无需联网，无墙
 */
export const analyzeWarningText = async (title: string, bodyHtml: string): Promise<PosterContent> => {
  // 模拟异步操作，保持接口一致
  return new Promise((resolve) => {
    
    // 1. 提取纯文本用于分析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // 2. 简单的落款提取规则：
    // 取最后一段文本，如果长度小于 30 个字，且不包含标点符号结尾（或者是日期），则认为是落款
    const lines = plainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let footer = "";
    
    if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        // 规则：长度小于 25，通常落款不会很长
        if (lastLine.length < 25) {
            footer = lastLine;
        }
    }

    // 3. 颜色建议 (默认为红色，UI层会根据主题覆盖)
    const suggestedColor = "#DE2910";

    // 4. 返回结果
    resolve({
      headline: title,
      bodyText: bodyHtml, 
      footer: footer,
      imagePrompt: "local-pattern", // 不再需要 AI Prompt
      suggestedColor: suggestedColor
    });
  });
};

/**
 * 本地逻辑替代 AI 绘图
 * 直接返回 null，让 UI 使用 CSS/SVG 渲染高质量矢量背景
 */
export const generatePosterBackground = async (prompt: string, theme: PosterTheme, textureStyle: string = 'clouds'): Promise<string | null> => {
  // 我们不再请求 Google 图片，直接返回 null
  // UI 组件 (PosterCanvas) 检测到 null 会自动渲染对应的 CSS 纹理
  return null;
};
