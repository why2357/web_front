import { useState, useRef } from 'react';
import { getHistoryDownloadUrl } from '../../../api/history';
import { getOrLoadAudio } from '../../../utils/audioCache';

type Item = any;

type Props = {
  history: Item[];
};

function getCreditsCost(item: any): number | null {
  const n = item.cost_credits ?? item.credits_used ?? item.credits ?? null;
  if (typeof n === 'number' && !Number.isNaN(n)) return n;
  return null;
}

function getAudioUrl(res: any): string | null {
  const url = res?.download_url ?? res?.url ?? res?.audio_url;
  return url && typeof url === 'string' ? url : null;
}

// 格式化时间显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function HistoryList({ history }: Props) {
  const [loadingId, setLoadingId] = useState<number | string | null>(null);
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const [progress, setProgress] = useState<Record<number | string, { current: number; duration: number }>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudioUrl = async (item: any, id: number | string): Promise<string | null> => {
    const cacheId = `history-${id}`;
    try {
      const direct = item.audio_url;
      if (direct && typeof direct === 'string') {
        return await getOrLoadAudio(cacheId, direct);
      }
      const res = await getHistoryDownloadUrl(id);
      const url = getAudioUrl(res);
      if (url) {
        return await getOrLoadAudio(cacheId, url);
      }
      return null;
    } catch (e) {
      console.error('获取音频失败', e);
      return null;
    }
  };

  const handlePlay = async (item: any, id: number | string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }
    setLoadingId(id);
    try {
      const url = await ensureAudioUrl(item, id);
      if (!url) {
        alert('无法获取播放链接');
        return;
      }
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingId(id);

      // 设置进度跟踪
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(prev => ({
            ...prev,
            [id]: { current: audio.currentTime, duration: audio.duration }
          }));
        }
      };

      audio.onended = () => {
        setPlayingId(null);
        setProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[id];
          return newProgress;
        });
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingId(null);
        setLoadingId(null);
        audioRef.current = null;
      };

      await audio.play();
    } catch (e: any) {
      console.error('播放失败', e);
      alert(e?.message || '播放失败，请稍后重试');
      setPlayingId(null);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSeek = (id: number | string, e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || playingId !== id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  const handleDownload = async (id: number | string) => {
    setLoadingId(id);
    try {
      const res = await getHistoryDownloadUrl(id);
      const url = getAudioUrl(res);
      if (!url) {
        alert('未获取到下载链接');
        return;
      }

      // 使用 fetch 获取文件并创建下载链接
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 创建隐藏的 a 标签并触发下载
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Voice_${String(id).slice(-6)}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 释放 URL 对象
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      console.error('下载失败', e);
      alert(e?.message || '下载失败，请稍后重试');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      {history.map((item: any, index: number) => {
        const creditsCost = getCreditsCost(item);
        const text = item.text_content ?? item.text ?? item.content ?? '';
        const id = item.task_id ?? item.id ?? index;
        const isLoading = loadingId === id;
        const isPlaying = playingId === id;
        const progressInfo = progress[id];

        return (
          <div key={id} className="feed-item">
            <div className="feed-dot"></div>
            <div className="feed-line"></div>
            <div className="feed-card">
              <div className="feed-header">
                <span>Voice_{String(id).slice(-6)}.wav</span>
                <span>{item.created_at ? new Date(item.created_at).toLocaleString() : '未知时间'}</span>
              </div>
              <div className="feed-text" title={text || ''}>{text || '—'}</div>

              {/* 播放器和费用水平布局 */}
              <div className="feed-actions-row">
                {/* 播放器区域 */}
                <div className="feed-player">
                <button
                  className={`feed-play-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={() => handlePlay(item, id)}
                  disabled={isLoading}
                >
                  <svg className="icon icon-sm" viewBox="0 0 24 24" fill="currentColor">
                    {isPlaying ? (
                      <rect x="6" y="4" width="4" height="16"></rect>
                    ) : (
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    )}
                  </svg>
                </button>

                {/* 进度条 */}
                {progressInfo && (
                  <div className="feed-progress" onClick={(e) => handleSeek(id, e)}>
                    <div className="feed-progress-track">
                      <div
                        className="feed-progress-fill"
                        style={{ width: `${(progressInfo.current / progressInfo.duration) * 100}%` }}
                      ></div>
                    </div>
                    <span className="feed-time">{formatTime(progressInfo.current)} / {formatTime(progressInfo.duration)}</span>
                  </div>
                )}

                {/* 下载按钮 */}
                <div className="feed-download" onClick={(e) => { e.stopPropagation(); handleDownload(id); }}>
                  <svg className="icon icon-sm" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
              </div>

              {/* 费用徽章 */}
              {creditsCost != null && <span className="cost-badge">-{creditsCost} pts</span>}
            </div>
            </div>
          </div>
        );
      })}

      {history.length === 0 && (
        <div className="timeline-empty">暂无历史记录</div>
      )}
    </>
  );
}
