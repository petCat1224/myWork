import type { TingwuRecordDetail, TingwuRecordSummary } from '../types';

/**
 * 模拟听悟记录列表数据。
 */
export const MOCK_RECORD_SUMMARIES: TingwuRecordSummary[] = [
  {
    id: 'rec-001',
    title: '产品需求评审会 · Q2 迭代规划',
    duration: 2847,
    status: 'completed',
    source: 'meeting',
    createdAt: '2026-05-27T09:30:00.000Z',
    tags: ['需求评审', 'Q2'],
  },
  {
    id: 'rec-002',
    title: '技术方案讨论：实时转写架构',
    duration: 1920,
    status: 'completed',
    source: 'upload',
    createdAt: '2026-05-26T14:15:00.000Z',
    tags: ['技术', '架构'],
  },
  {
    id: 'rec-003',
    title: '客户访谈录音 · 金融场景',
    duration: 3605,
    status: 'processing',
    source: 'upload',
    createdAt: '2026-05-28T08:00:00.000Z',
    tags: ['客户访谈'],
  },
  {
    id: 'rec-004',
    title: '周会同步 · 5月第四周',
    duration: 1680,
    status: 'completed',
    source: 'live',
    createdAt: '2026-05-24T10:00:00.000Z',
    tags: ['周会'],
  },
  {
    id: 'rec-005',
    title: '培训录播 · 通义听悟功能介绍',
    duration: 4200,
    status: 'failed',
    source: 'upload',
    createdAt: '2026-05-23T16:45:00.000Z',
    tags: ['培训'],
  },
];

/**
 * 模拟听悟记录详情数据。
 */
export const MOCK_RECORD_DETAILS: Record<string, TingwuRecordDetail> = {
  'rec-001': {
    ...MOCK_RECORD_SUMMARIES[0],
    overview:
      '## 会议导读\n\n本次会议围绕 **Q2 产品迭代规划** 展开，重点讨论了：\n\n- 听写准确率优化\n- 多人会议 **发言人识别**\n- B 端 **数据导出** 能力\n\n> 团队一致同意优先交付「章节速览」与「要点提取」，6 月中旬前完成内测。',
    transcript: [
      {
        id: 'seg-1',
        speakerId: 'sp-1',
        speakerName: '张明',
        startTime: 0,
        endTime: 18,
        text: '大家好，今天我们主要讨论 Q2 的产品迭代方向，先看上一版本的反馈数据。',
      },
      {
        id: 'seg-2',
        speakerId: 'sp-2',
        speakerName: '李薇',
        startTime: 19,
        endTime: 42,
        text: '从用户反馈来看，转写准确率在嘈杂环境下还有提升空间，另外多人会议的发言人区分是高频诉求。',
      },
      {
        id: 'seg-3',
        speakerId: 'sp-1',
        speakerName: '张明',
        startTime: 43,
        endTime: 68,
        text: '同意。我建议 Q2 优先做章节速览和要点提取，这两项在竞品里已经是标配了。',
      },
      {
        id: 'seg-4',
        speakerId: 'sp-3',
        speakerName: '王浩',
        startTime: 69,
        endTime: 95,
        text: '技术侧评估章节切分可以用 LLM 结合静音检测，预计两周出 POC。发言人识别需要额外标注数据。',
      },
      {
        id: 'seg-5',
        speakerId: 'sp-2',
        speakerName: '李薇',
        startTime: 96,
        endTime: 120,
        text: 'B 端客户还提到批量导出和 API 对接，这个可以放到 Q2 末期或者 Q3 初期。',
      },
    ],
    chapters: [
      {
        id: 'ch-1',
        title: '开场与议程',
        startTime: 0,
        summary: '明确会议目标：回顾 Q1 反馈，确定 Q2 优先级。',
      },
      {
        id: 'ch-2',
        title: '用户反馈与痛点',
        startTime: 19,
        summary: '转写准确率、发言人识别、导出能力是核心诉求。',
      },
      {
        id: 'ch-3',
        title: 'Q2 功能优先级',
        startTime: 43,
        summary: '章节速览、要点提取为 P0；批量导出为 P1。',
      },
      {
        id: 'ch-4',
        title: '技术方案与时间线',
        startTime: 69,
        summary: '章节切分 POC 两周；发言人识别需补充训练数据。',
      },
    ],
    speakers: [
      {
        speakerId: 'sp-1',
        speakerName: '张明',
        ratio: 38,
        highlights: ['主导 Q2 优先级排序', '推动章节速览立项'],
      },
      {
        speakerId: 'sp-2',
        speakerName: '李薇',
        ratio: 35,
        highlights: ['汇总用户反馈', '提出 B 端导出需求'],
      },
      {
        speakerId: 'sp-3',
        speakerName: '王浩',
        ratio: 27,
        highlights: ['评估技术可行性', '给出 POC 时间预估'],
      },
    ],
    keyPoints: [
      {
        id: 'kp-1',
        type: 'decision',
        content: 'Q2 P0：章节速览 + 要点提取',
        timestamp: 43,
      },
      {
        id: 'kp-2',
        type: 'action',
        content: '王浩：两周内完成章节切分 POC',
        timestamp: 69,
      },
      {
        id: 'kp-3',
        type: 'insight',
        content: '发言人识别需额外标注数据支撑',
        timestamp: 69,
      },
      {
        id: 'kp-4',
        type: 'action',
        content: '李薇：整理 B 端导出需求文档',
        timestamp: 96,
      },
    ],
    chatHistory: [
      {
        id: 'msg-1',
        role: 'user',
        content: '本次会议的核心结论是什么？',
        createdAt: '2026-05-27T10:00:00.000Z',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content:
          '核心结论是 Q2 优先交付「章节速览」和「要点提取」，章节切分 POC 预计两周完成，发言人识别需补充标注数据。',
        createdAt: '2026-05-27T10:00:02.000Z',
      },
    ],
  },
};
