import { execSync } from 'child_process';

/**
 * 启动前释放指定端口（Windows）。
 * @param {string} port - 端口号
 */
function freePort(port) {
  if (process.platform !== 'win32') {
    return;
  }

  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    out.split('\n').forEach((line) => {
      const match = line.trim().match(/LISTENING\s+(\d+)/i);
      if (match) {
        pids.add(match[1]);
      }
    });

    pids.forEach((pid) => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        // eslint-disable-next-line no-console
        console.log(`[free-port] 已结束占用 ${port} 的进程 PID ${pid}`);
      } catch {
        // 进程可能已退出
      }
    });
  } catch {
    // 端口未被占用
  }
}

const port = process.argv[2] || '3001';
freePort(port);
