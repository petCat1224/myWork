/**
 * 麦克风相关错误类型。
 * - permission：用户拒绝或未授权（需引导去浏览器设置）
 * - device：无麦克风设备
 * - recording：已拿到权限后，MediaRecorder 编码/录制过程出错
 */
export type MicrophoneErrorType = 'permission' | 'device' | 'recording' | 'unknown';

export interface MicrophoneError {
  type: MicrophoneErrorType;
  message: string;
}

/**
 * 解析 getUserMedia 抛出的 DOMException，区分「没弹窗」与「用户拒绝」等场景。
 *
 * 注意：浏览器权限弹窗只会在调用 getUserMedia 时由**浏览器**弹出，
 * 应用代码无法自定义该原生弹窗；若用户曾点过「禁止」，之后不会再弹，只能去地址栏改站点权限。
 *
 * @param error - catch 到的异常
 * @returns 结构化错误
 */
export function parseGetUserMediaError(error: unknown): MicrophoneError {
  const domError = error as DOMException;

  switch (domError.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return {
        type: 'permission',
        message:
          '麦克风权限被拒绝。请在浏览器地址栏左侧点击锁图标，允许本站点使用麦克风后重试。',
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        type: 'device',
        message: '未检测到可用麦克风，请连接设备后重试。',
      };
    case 'NotReadableError':
      return {
        type: 'device',
        message: '麦克风被其他应用占用，请关闭后重试。',
      };
    case 'SecurityError':
      return {
        type: 'permission',
        message: '当前页面非安全上下文（需 HTTPS 或 localhost）才能访问麦克风。',
      };
    default:
      return {
        type: 'unknown',
        message: domError.message || '无法访问麦克风，请检查浏览器权限设置。',
      };
  }
}

/**
 * 尝试查询麦克风权限状态（部分浏览器不支持 Permissions API）。
 * @returns 权限状态或 null（不支持时）
 */
export async function queryMicrophonePermission(): Promise<PermissionState | null> {
  if (!navigator.permissions?.query) {
    return null;
  }
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state;
  } catch {
    return null;
  }
}
