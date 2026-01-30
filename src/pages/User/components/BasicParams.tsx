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
        <label className="bp-label">语速</label>
        <div className="slider-container">
          <div className="slider-progress" style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${((speed - 0.5) / 1.5) * 100}%`, background: 'var(--primary-light)', borderRadius: 3 }} />
          <input type="range" className="slider" min="0.5" max="2.0" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ background: 'transparent', position: 'relative', zIndex: 1 }} />
        </div>
        <span className="bp-val-display">{speed.toFixed(1)}</span>
        <button type="button" className="emo-reset-btn" onClick={() => setSpeed(1.0)} title="重置为 1.0" aria-label="重置语速">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          重置
        </button>
      </div>

      <div className="bp-item">
        <label className="bp-label">音量</label>
        <div className="slider-container">
          <div className="slider-progress" style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${((volume - 0.1) / 1.9) * 100}%`, background: 'var(--primary-light)', borderRadius: 3 }} />
          <input type="range" className="slider" min="0.1" max="2.0" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ background: 'transparent', position: 'relative', zIndex: 1 }} />
        </div>
        <span className="bp-val-display">{volume.toFixed(1)}</span>
        <button type="button" className="emo-reset-btn" onClick={() => setVolume(1.0)} title="重置为 1.0" aria-label="重置音量">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          重置
        </button>
      </div>
    </div>
  );
}
