import type { MouseEvent } from 'react';
import { Voice } from '../../../api/voice';

type Props = {
  voice: Voice;
  active?: boolean;
  playing?: boolean;
  onSelect?: (v: Voice) => void;
  onPreview?: (e: MouseEvent, v: Voice) => void;
};

export default function VoiceCard({ voice, active, playing, onSelect, onPreview }: Props) {
  return (
    <div
      key={voice.id}
      className={`voice-card ${active ? 'active' : ''} ${playing ? 'playing' : ''}`}
      onClick={() => onSelect?.(voice)}
    >
      <div className={`voice-icon ${voice.gender === 'male' ? 'v-blue' : 'v-pink'}`}>
        <svg className="icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
        <div className="voice-play-overlay" onClick={(e) => onPreview?.(e, voice)}>
          {/* 播放图标（三角形）- hover 时显示 */}
          <svg className="icon play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"></path>
          </svg>
          {/* 暂停图标（两条竖线）- 仅在播放且非 hover 时显示 */}
          <svg className="icon 
          " viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
          </svg>
        </div>
      </div>

      <div className="voice-info">
        <div className="voice-name">{voice.name}</div>
        <div className="voice-tag">{voice.category}</div>
      </div>
    </div>
  );
}
