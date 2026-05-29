import { useEffect } from 'react';
import {
  BulbOutlined,
  CommentOutlined,
  FileTextOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, List, Tabs, Tag } from 'antd';

import MarkdownContent from './MarkdownContent';
import { useDashScopeChat } from '../hooks/useDashScopeChat';
import type {
  TingwuChapter,
  TingwuKeyPoint,
  TingwuRecordDetail,
  TingwuSpeakerSummary,
} from '../types';
import { initMessages, setChatInput } from '../store/chatSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';
import { formatDuration } from '../utils/format';

interface InsightPanelProps {
  /** 记录详情 */
  record: TingwuRecordDetail;
  /** 点击章节/要点跳转 */
  onSeek: (time: number) => void;
}

const KEY_POINT_LABEL: Record<string, string> = {
  action: '待办',
  decision: '决策',
  insight: '洞察',
};

/**
 * AI 洞察面板：Markdown 导读 + 章节/发言人/要点 + 流式问答。
 * @param props - 面板属性
 * @returns 洞察面板节点
 */
function InsightPanel({ record, onSeek }: InsightPanelProps) {
  const dispatch = useTingwuDispatch();
  const { messages, asking, input, ask } = useDashScopeChat();
  const streaming = useTingwuSelector((state) => state.detail.streaming);

  useEffect(() => {
    dispatch(initMessages(record.chatHistory));
  }, [dispatch, record.id, record.chatHistory]);

  /**
   * 提交 AI 问答（ReadableStream 风格逐字输出）。
   */
  const handleAsk = () => {
    ask(input, record.overview || record.title);
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="inline-flex items-center gap-1">
          <FileTextOutlined />
          导读
        </span>
      ),
      children: record.overview ? (
        <MarkdownContent source={record.overview} />
      ) : (
        <Empty description="暂无导读" />
      ),
    },
    {
      key: 'chapters',
      label: (
        <span className="inline-flex items-center gap-1">
          <UnorderedListOutlined />
          章节
        </span>
      ),
      children: <ChaptersTab chapters={record.chapters} onSeek={onSeek} />,
    },
    {
      key: 'speakers',
      label: (
        <span className="inline-flex items-center gap-1">
          <TeamOutlined />
          发言人
        </span>
      ),
      children: <SpeakersTab speakers={record.speakers} />,
    },
    {
      key: 'keypoints',
      label: (
        <span className="inline-flex items-center gap-1">
          <BulbOutlined />
          要点
        </span>
      ),
      children: <KeyPointsTab keyPoints={record.keyPoints} onSeek={onSeek} />,
    },
    {
      key: 'chat',
      label: (
        <span className="inline-flex items-center gap-1">
          <CommentOutlined />
          问答
          {streaming && (
            <span className="tingwu-stream-badge ml-1 text-[10px] text-[#6155f5]">转写中</span>
          )}
        </span>
      ),
      children: (
        <div className="flex h-[420px] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pb-3">
            {messages.length === 0 ? (
              <Empty description="向 AI 提问关于本段录音的内容" />
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    'rounded-lg px-3 py-2',
                    msg.role === 'user'
                      ? 'ml-6 bg-[#6155f5]/10'
                      : 'mr-6 bg-[#f4f5f9]',
                  ].join(' ')}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownContent source={msg.content || '_思考中…_' } className="text-sm" />
                  ) : (
                    <p className="text-sm text-gray-800">{msg.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 border-t border-gray-100 pt-3">
            <Input
              placeholder="例如：本次会议的核心结论是什么？"
              value={input}
              onChange={(e) => dispatch(setChatInput(e.target.value))}
              onPressEnter={handleAsk}
            />
            <Button type="primary" loading={asking} onClick={handleAsk}>
              提问
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="tingwu-panel h-full p-4">
      <Tabs items={tabItems} />
    </div>
  );
}

interface ChaptersTabProps {
  chapters: TingwuChapter[];
  onSeek: (time: number) => void;
}

/** 章节 Tab */
function ChaptersTab({ chapters, onSeek }: ChaptersTabProps) {
  if (chapters.length === 0) {
    return <Empty description="暂无章节" />;
  }

  return (
    <List
      dataSource={chapters}
      renderItem={(item) => (
        <List.Item
          className="!px-0"
          actions={[
            <Button key="seek" type="link" size="small" onClick={() => onSeek(item.startTime)}>
              {formatDuration(item.startTime)}
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={item.title}
            description={<MarkdownContent source={item.summary} className="text-xs" />}
          />
        </List.Item>
      )}
    />
  );
}

interface SpeakersTabProps {
  speakers: TingwuSpeakerSummary[];
}

/** 发言人 Tab */
function SpeakersTab({ speakers }: SpeakersTabProps) {
  if (speakers.length === 0) {
    return <Empty description="暂无发言人分析" />;
  }

  return (
    <List
      dataSource={speakers}
      renderItem={(item) => (
        <List.Item className="!px-0">
          <List.Item.Meta
            title={`${item.speakerName} · 发言占比 ${item.ratio}%`}
            description={
              <ul className="mt-1 list-disc pl-4 text-sm text-gray-600">
                {item.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            }
          />
        </List.Item>
      )}
    />
  );
}

interface KeyPointsTabProps {
  keyPoints: TingwuKeyPoint[];
  onSeek: (time: number) => void;
}

/** 要点 Tab */
function KeyPointsTab({ keyPoints, onSeek }: KeyPointsTabProps) {
  if (keyPoints.length === 0) {
    return <Empty description="暂无要点" />;
  }

  return (
    <List
      dataSource={keyPoints}
      renderItem={(item) => (
        <List.Item
          className="!px-0"
          actions={
            item.timestamp != null
              ? [
                  <Button
                    key="seek"
                    type="link"
                    size="small"
                    onClick={() => onSeek(item.timestamp!)}
                  >
                    {formatDuration(item.timestamp)}
                  </Button>,
                ]
              : undefined
          }
        >
          <Tag color="purple">{KEY_POINT_LABEL[item.type]}</Tag>
          <span className="text-sm text-gray-700">{item.content}</span>
        </List.Item>
      )}
    />
  );
}

export default InsightPanel;
