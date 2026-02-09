import { useState, useRef, useEffect } from 'react';
import { getHistoryDownloadUrl } from '../../../api/history';
import { getOrLoadAudio, audioCache } from '../../../utils/audioCache';

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

export default function HistoryList({ history }: Props) {
  const [loadingId, setLoadingId] = useState<number | string | null>(null);
  const [playingId, setPlayingId] = useState<number | string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudioUrl = async (item: any, id: number | string): Promise<string | null> => {
    // 优先使用缓存
    const cacheId = `history-${id}`;
    try {
      const direct = item.audio_url;
      if (direct && typeof direct === 'string') {
        // 从缓存或网络获取音频
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
      audio.onended = () => {
        setPlayingId(null);
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

  const handleDownload = async (id: number | string) => {
    setLoadingId(id);
    try {
      const res = await getHistoryDownloadUrl(id);
      const url = getAudioUrl(res);
      if (!url) {
        alert('未获取到下载链接');
        return;
      }
      // 如果已缓存，直接使用缓存的 Blob URL
      const cacheId = `history-${id}`;
      const cachedUrl = await audioCache.get(cacheId);
      window.open(cachedUrl || url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      console.error('获取下载链接失败', e);
      alert(e?.message || '获取下载链接失败，请稍后重试');
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
        return (
          <div key={id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-item-meta">
              {item.created_at ? new Date(item.created_at).toLocaleString() : '未知时间'}
            </div>
            <div className="timeline-item-text">{text || '—'}</div>
            {creditsCost != null && (
              <div className="timeline-item-credits">
                <span className="credits-cost">-{creditsCost}</span>
              </div>
            )}
            <div className="timeline-item-actions">
              <button
                type="button"
                className={`history-icon-btn history-icon-btn--play${isPlaying ? ' is-playing' : ''}`}
                disabled={isLoading}
                onClick={() => handlePlay(item, id)}
                title={isPlaying ? '停止' : '播放'}
                aria-label={isPlaying ? '停止' : '播放'}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="history-icon-btn history-icon-btn--download"
                disabled={isLoading}
                onClick={() => handleDownload(id)}
                title="下载"
                aria-label="下载"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
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
