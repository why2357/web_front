type GeneratedAudio = {
  id: string;
  audioUrl: string;
  text: string;
  voiceName?: string;
  creditsUsed?: number;
  createdAt: number;
};

type ProgressInfo = {
  current: number;
  duration: number;
};

type Props = {
  audios: GeneratedAudio[];
  playingId: string | null;
  onPlay: (audio: GeneratedAudio) => void;
  onRemove: (id: string) => void;
  audioProgress?: Record<string, ProgressInfo>;
  currentAudioPlayer?: HTMLAudioElement | null;
  onSeek?: (percentage: number) => void;
};

// 格式化时间显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GeneratedAudioList({
  audios,
  playingId,
  onPlay,
  onRemove,
  audioProgress = {},
  currentAudioPlayer = null,
  onSeek
}: Props) {
  // 只显示最新的一条记录
  const latestAudio = audios.length > 0 ? audios[0] : null;
  const progressInfo = latestAudio ? audioProgress[latestAudio.id] : null;

  // 处理进度条点击跳转
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentAudioPlayer || !latestAudio || playingId !== latestAudio.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    currentAudioPlayer.currentTime = percentage * currentAudioPlayer.duration;
    onSeek?.(percentage);
  };

  // 播放/暂停图标
  const playIcon = (
    <svg className="icon icon-sm play-icon" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
  const pauseIcon = (
    <svg className="icon icon-sm pause-icon" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );

  // 下载图标
  const downloadIcon = (
    <svg className="icon" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  if (!latestAudio) {
    return null;
  }

  return (
    <div className="result-card fade-in">
      <button
        className={`play-btn-circle ${playingId === latestAudio.id ? 'playing' : ''}`}
        onClick={() => onPlay(latestAudio)}
        aria-label={playingId === latestAudio.id ? '暂停' : '播放'}
      >
        <div className="visualizer">
          <span></span><span></span><span></span><span></span>
        </div>
        {playingId === latestAudio.id ? pauseIcon : playIcon}
      </button>
      <div className="result-info">
        <div className="result-text">{latestAudio.text}</div>
        {latestAudio.voiceName && (
          <div className="result-voice">{latestAudio.voiceName}</div>
        )}
        {/* 进度条 */}
        {progressInfo && (
          <div className="result-progress" onClick={handleSeek}>
            <div className="result-progress-track">
              <div
                className="result-progress-fill"
                style={{ width: `${(progressInfo.current / progressInfo.duration) * 100}%` }}
              ></div>
            </div>
            <span className="result-time">
              {formatTime(progressInfo.current)} / {formatTime(progressInfo.duration)}
            </span>
          </div>
        )}
      </div>
      <div className="result-actions">
        {latestAudio.creditsUsed !== undefined && (
          <span className="cost-badge">-{latestAudio.creditsUsed} pts</span>
        )}
        <a
          href={latestAudio.audioUrl}
          download
          className="action-icon"
          aria-label="下载"
          title="下载音频"
        >
          {downloadIcon}
        </a>
      </div>
    </div>
  );
}
