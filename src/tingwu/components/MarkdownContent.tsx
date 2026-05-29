import { useMemo } from 'react';

import { renderMarkdown } from '../utils/markdown';

interface MarkdownContentProps {
  /** Markdown 源文本 */
  source: string;
  /** 额外 className */
  className?: string;
}

/**
 * 基于 markdown-it 的 Markdown 渲染组件。
 * @param props - 组件属性
 * @returns 渲染后的 HTML 容器
 */
function MarkdownContent({ source, className = '' }: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(source), [source]);

  if (!html) {
    return null;
  }

  return (
    <div
      className={`tingwu-markdown prose prose-sm max-w-none text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownContent;
