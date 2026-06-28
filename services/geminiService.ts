import { PosterContent } from "../types";

/**
 * 内容解析（纯前端，无网络）。
 *
 * 历史背景：早期版本接 Google Gemini 做文本分析与图片生成。
 * 重设计后改为纯前端实现：背景用 CSS/SVG 渲染，文本只做轻量落款提取。
 * 函数名从 analyzeWarningText 改为 analyzeContent，避免"warning"误导。
 * （旧名已无任何引用，如历史代码引用旧名请改为此名。）
 */
export const analyzeContent = async (title: string, bodyHtml: string): Promise<PosterContent> => {
  return new Promise((resolve) => {
    // 提取纯文本用于分析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // 落款提取规则：取最后一段，长度<25 视为落款
    const lines = plainText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    let footer = "";
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      if (lastLine.length < 25) {
        footer = lastLine;
      }
    }

    resolve({
      headline: title,
      bodyText: bodyHtml,
      footer,
    });
  });
};
