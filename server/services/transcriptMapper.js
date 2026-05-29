/**
 * 将 Paraformer 识别结果 JSON 映射为前端 TingwuTranscriptSegment 结构。
 * @param {object} resultJson - transcription_url 下载的 JSON
 * @returns {Array<object>} 转写片段列表
 */
export function mapParaformerResultToSegments(resultJson) {
  const transcripts = resultJson?.transcripts ?? [];
  const segments = [];
  let index = 0;

  transcripts.forEach((transcript) => {
    const sentences = transcript?.sentences ?? [];

    if (sentences.length === 0 && transcript?.text) {
      segments.push({
        id: `seg-${index}`,
        speakerId: 'sp-0',
        speakerName: '说话人',
        startTime: 0,
        endTime: Math.round((resultJson?.properties?.original_duration_in_milliseconds ?? 0) / 1000),
        text: transcript.text,
      });
      index += 1;
      return;
    }

    sentences.forEach((sentence) => {
      const speakerId = `sp-${sentence.speaker_id ?? 0}`;
      segments.push({
        id: `seg-${index}`,
        speakerId,
        speakerName: `说话人 ${(sentence.speaker_id ?? 0) + 1}`,
        startTime: Math.round((sentence.begin_time ?? 0) / 1000),
        endTime: Math.round((sentence.end_time ?? 0) / 1000),
        text: sentence.text ?? '',
      });
      index += 1;
    });
  });

  return segments;
}

/**
 * 将毫秒转为秒。
 * @param {number} ms - 毫秒
 * @returns {number} 秒
 */
export function msToSec(ms) {
  return Math.round(ms / 1000);
}
