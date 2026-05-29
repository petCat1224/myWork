/**
 * 听悟记录处理状态。
 */
export type TingwuRecordStatus = 'processing' | 'completed' | 'failed';

/**
 * 听悟记录来源类型。
 */
export type TingwuRecordSource = 'upload' | 'meeting' | 'live';

/**
 * 转写片段（带说话人与时间戳）。
 */
export interface TingwuTranscriptSegment {
  /** 片段唯一 ID */
  id: string;
  /** 说话人标识 */
  speakerId: string;
  /** 说话人展示名 */
  speakerName: string;
  /** 开始时间（秒） */
  startTime: number;
  /** 结束时间（秒） */
  endTime: number;
  /** 转写文本 */
  text: string;
}

/**
 * 章节摘要。
 */
export interface TingwuChapter {
  /** 章节 ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节起始时间（秒） */
  startTime: number;
  /** 章节摘要 */
  summary: string;
}

/**
 * 发言人总结。
 */
export interface TingwuSpeakerSummary {
  /** 说话人 ID */
  speakerId: string;
  /** 说话人名称 */
  speakerName: string;
  /** 发言占比（0-100） */
  ratio: number;
  /** 发言要点 */
  highlights: string[];
}

/**
 * 关键要点 / 待办。
 */
export interface TingwuKeyPoint {
  /** 要点 ID */
  id: string;
  /** 要点类型 */
  type: 'action' | 'decision' | 'insight';
  /** 要点内容 */
  content: string;
  /** 关联时间（秒，可选） */
  timestamp?: number;
}

/**
 * AI 问答消息。
 */
export interface TingwuChatMessage {
  /** 消息 ID */
  id: string;
  /** 角色 */
  role: 'user' | 'assistant';
  /** 消息内容 */
  content: string;
  /** 发送时间 ISO 字符串 */
  createdAt: string;
}

/**
 * 听悟记录列表项。
 */
export interface TingwuRecordSummary {
  /** 记录 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 时长（秒） */
  duration: number;
  /** 处理状态 */
  status: TingwuRecordStatus;
  /** 来源 */
  source: TingwuRecordSource;
  /** 创建时间 ISO 字符串 */
  createdAt: string;
  /** 标签 */
  tags: string[];
}

/**
 * 听悟记录详情（含 AI 洞察）。
 */
export interface TingwuRecordDetail extends TingwuRecordSummary {
  /** 全文导读 */
  overview: string;
  /** 转写片段列表 */
  transcript: TingwuTranscriptSegment[];
  /** 章节列表 */
  chapters: TingwuChapter[];
  /** 发言人总结 */
  speakers: TingwuSpeakerSummary[];
  /** 关键要点 */
  keyPoints: TingwuKeyPoint[];
  /** AI 问答历史 */
  chatHistory: TingwuChatMessage[];
  /** 音频地址（演示用占位） */
  audioUrl?: string;
}

/**
 * 列表查询参数。
 */
export interface TingwuListQuery {
  /** 搜索关键词 */
  keyword?: string;
  /** 状态筛选 */
  status?: TingwuRecordStatus | 'all';
}
