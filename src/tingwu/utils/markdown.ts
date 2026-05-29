import MarkdownIt from 'markdown-it';

/**
 * 全局 markdown-it 实例（听悟导读 / 问答渲染）。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

/**
 * 将 Markdown 渲染为 HTML 字符串。
 * @param source - Markdown 源文本
 * @returns 安全 HTML（调用方需配合 dangerouslySetInnerHTML 或 DOMPurify）
 */
export function renderMarkdown(source: string): string {
  if (!source?.trim()) {
    return '';
  }
  return md.render(source);
}
