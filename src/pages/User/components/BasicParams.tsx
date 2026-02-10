type Props = {
  speed: number;
  setSpeed: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
};

export default function BasicParams({ speed, setSpeed, volume, setVolume }: Props) {
  return (
    <div className="basic-params">
      <div className="card-header-text" style={{ fontSize: '0.9rem', marginBottom: 12 }}>基础参数</div>

      <div className="bp-item">
        <div className="bp-label-row">
          <div className="bp-badge">
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14v-4"></path><path d="M12 2a10 10 0 0 0-8.66 15"></path><path d="M20.66 17A10 10 0 0 0 12 2"></path>
            </svg>
            语速
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="bp-val-display">{speed.toFixed(1)}</div>
          <svg className="icon icon-sm es-reset" viewBox="0 0 24 24" onClick={() => setSpeed(1.0)} style={{ cursor: 'pointer' }}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </div>
        <div className="bp-input-group">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>0.8</span>
          <div className="bp-slider-track">
            <div className="slider-container">
              <div className="slider-progress" style={{ width: `${((speed - 0.8) / 1.7) * 100}%` }}></div>
              <input type="range" min="0.8" max="2.5" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>2.5</span>
        </div>
      </div>

      <div className="bp-item">
        <div className="bp-label-row">
          <div className="bp-badge">
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            音量
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="bp-val-display">{volume.toFixed(1)}</div>
          <svg className="icon icon-sm es-reset" viewBox="0 0 24 24" onClick={() => setVolume(1.0)} style={{ cursor: 'pointer' }}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </div>
        <div className="bp-input-group">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>0.1</span>
          <div className="bp-slider-track">
            <div className="slider-container">
              <div className="slider-progress" style={{ width: `${((volume - 0.1) / 1.9) * 100}%` }}></div>
              <input type="range" min="0.1" max="2" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>2</span>
        </div>
      </div>
    </div>
  );
}
