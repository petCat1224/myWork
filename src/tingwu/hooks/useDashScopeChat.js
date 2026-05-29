import { useCallback } from 'react';

import { askQuestionStream } from '../store/chatSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';

/**
 * DashScope 流式问答 Hook（经 Node 中间层代理，API Key 不暴露给浏览器）。
 * @returns 问答状态与提问函数
 */
export function useDashScopeChat() {
  const dispatch = useTingwuDispatch();
  const { messages, asking, input } = useTingwuSelector((state) => state.chat);

  /**
   * 向 Qwen 提问。
   * @param {string} question - 用户问题
   * @param {string} context - 听记上下文（导读/转写摘要）
   */
  const ask = useCallback(
    (question, context) => {
      const q = question?.trim();
      if (!q) return;
      dispatch(askQuestionStream({ question: q, context }));
    },
    [dispatch],
  );

  return { messages, asking, input, ask };
}
