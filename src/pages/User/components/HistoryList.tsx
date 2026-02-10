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
          <div key={id} className="feed-item">
            <div className="feed-dot"></div>
            <div className="feed-line"></div>
            <div className="feed-card" onClick={() => {
              // Copy text to input functionality could be added here
              const textInput = document.querySelector('.main-textarea') as HTMLTextAreaElement;
              if (textInput && text) {
                textInput.value = text;
                textInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}>
              <div className="feed-meta">
                <span>Voice_{String(id).slice(-6)}.wav</span>
                <span>{item.created_at ? new Date(item.created_at).toLocaleString() : '未知时间'}</span>
              </div>
              <div className="feed-text">{text || '—'}</div>
              <div className="feed-actions">
                {creditsCost != null && <span className="cost-badge">-{creditsCost} pts</span>}
                <div className="action-icon" onClick={(e) => { e.stopPropagation(); handleDownload(id); }}>
                  <svg className="icon icon-sm" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
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
