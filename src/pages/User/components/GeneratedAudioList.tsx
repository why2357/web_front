type GeneratedAudio = {
  id: string;
  audioUrl: string;
  text: string;
  voiceName?: string;
  creditsUsed?: number;
  createdAt: number;
};

type Props = {
  audios: GeneratedAudio[];
  playingId: string | null;
  onPlay: (audio: GeneratedAudio) => void;
  onRemove: (id: string) => void;
};

export default function GeneratedAudioList({ audios, playingId, onPlay, onRemove }: Props) {
  if (audios.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="generated-audio-list">
      <div className="generated-audio-list__header">
        <h4>生成结果</h4>
        <span className="generated-audio-list__count">{audios.length} 个音频</span>
      </div>
      <div className="generated-audio-list__items">
        {audios.map((audio) => (
          <div key={audio.id} className={`generated-audio-item ${playingId === audio.id ? 'playing' : ''}`}>
            <div className="generated-audio-item__main">
              <button
                type="button"
                className="generated-audio-item__play-btn"
                onClick={() => onPlay(audio)}
                aria-label={playingId === audio.id ? '暂停' : '播放'}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  {playingId === audio.id ? (
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  ) : (
                    <path d="M8 5v14l11-7z" />
                  )}
                </svg>
              </button>
              <div className="generated-audio-item__info">
                <div className="generated-audio-item__text">{audio.text}</div>
                <div className="generated-audio-item__meta">
                  {audio.voiceName && <span className="generated-audio-item__voice">{audio.voiceName}</span>}
                  {audio.creditsUsed !== undefined && (
                    <span className="generated-audio-item__credits">
                      积分: {audio.creditsUsed}
                    </span>
                  )}
                  <span className="generated-audio-item__time">{formatTime(audio.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="generated-audio-item__actions">
              <a
                href={audio.audioUrl}
                download
                className="generated-audio-item__download-btn"
                aria-label="下载"
                title="下载音频"
              >
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <button
                type="button"
                className="generated-audio-item__remove-btn"
                onClick={() => onRemove(audio.id)}
                aria-label="删除"
                title="删除"
              >
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
