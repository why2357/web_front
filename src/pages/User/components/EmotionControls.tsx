import { useState } from 'react';
import type { RefObject, ChangeEvent, MouseEvent } from 'react';

type Emotions = {
  joy: number;
  disgust: number;
  anger: number;
  low: number;
  sadness: number;
  surprise: number;
  fear: number;
  calm: number;
};

type Props = {
  emotionTab: string;
  setEmotionTab: (tab: string) => void;
  emoRefFile: File | null;
  emoRefInputRef: RefObject<HTMLInputElement | null>;
  uploadingEmo: boolean;
  handleEmoRefUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleEmoRefUploadFile: (file: File) => Promise<void>;
  handleRemoveEmoRef: (e?: MouseEvent) => void;
  handlePlayEmoRef: (e?: MouseEvent) => void;
  emoWeight: number;
  setEmoWeight: (v: number) => void;
  emoText: string;
  setEmoText: (s: string) => void;
  // 新：情感向量
  emoVector: Emotions;
  setEmoVector: (v: Emotions) => void;
};

export default function EmotionControls(props: Props) {
  const {
    emotionTab,
    setEmotionTab,
    emoRefFile,
    emoRefInputRef,
    uploadingEmo,
    handleEmoRefUpload,
    handleEmoRefUploadFile,
    handleRemoveEmoRef,
    handlePlayEmoRef,
    emoWeight,
    setEmoWeight,
    emoText,
    setEmoText,
    // 新：情感向量相关
    emoVector,
    setEmoVector,
  } = props;

  const emotionItems: { key: keyof Emotions; label: string; emoji: string }[] = [
    { key: 'joy', label: '喜', emoji: '😊' },
    { key: 'disgust', label: '厌恶', emoji: '🤢' },
    { key: 'anger', label: '怒', emoji: '😡' },
    { key: 'low', label: '低落', emoji: '😕' },
    { key: 'sadness', label: '哀', emoji: '😢' },
    { key: 'surprise', label: '惊喜', emoji: '😲' },
    { key: 'fear', label: '惧', emoji: '😨' },
    { key: 'calm', label: '平静', emoji: '🙂' },
  ];

  const clamp01 = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
  const [emoDragOver, setEmoDragOver] = useState(false);

  return (
    <div>
      <div className="card-tabs">
        <div className={`tab-btn ${emotionTab === 'default' ? 'active' : ''}`} onClick={() => setEmotionTab('default')}>
          <span>默认</span>
        </div>
        <div className={`tab-btn ${emotionTab === 'manual' ? 'active' : ''}`} onClick={() => setEmotionTab('manual')}>
          <span>情感控制</span>
        </div>
        <div className={`tab-btn ${emotionTab === 'reference' ? 'active' : ''}`} onClick={() => setEmotionTab('reference')}>
          <span>情感参考</span>
        </div>
        <div className={`tab-btn ${emotionTab === 'text' ? 'active' : ''}`} onClick={() => setEmotionTab('text')}>
          <span>情感文本</span>
        </div>
      </div>

      <div className="emotion-panel-shell" data-panel-container>
      {emotionTab === 'default' && (
        <div className="smart-emotion-box emotion-panel emotion-panel--centered">
          <svg className="icon" style={{ width: 24, height: 24, marginBottom: 8 }} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="smart-emotion-title">智能情感模式</span>
          不应用任何特殊情感设置，AI 将根据文本上下文自然演绎。
        </div>
      )} 

      {emotionTab === 'reference' && (
        <div className="emo-ref-wrap emotion-panel">
          {/* 与克隆一致的上传框：虚线框 + 图标 + 文案 */}
          <div
            className={`emo-ref-upload ${!emoRefFile ? 'upload-area' : 'emo-ref-upload--has-file'}${emoDragOver ? ' upload-area--drag-over' : ''}`}
            onClick={() => !emoRefFile && emoRefInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEmoDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEmoDragOver(false); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEmoDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file?.type.startsWith('audio/')) handleEmoRefUploadFile(file);
            }}
          >
            <input type="file" ref={emoRefInputRef} style={{ display: 'none' }} accept="audio/*" onChange={handleEmoRefUpload} />

            {emoRefFile ? (
              <div className="emo-ref-ready">
                <div className="emo-ref-ready-title">
                  {uploadingEmo ? '上传中...' : '已选择文件'}
                </div>
                <div className="emo-ref-ready-name" title={emoRefFile.name}>
                  {emoRefFile.name}
                </div>
                <div className="emo-ref-ready-actions">
                  <button type="button" onClick={handlePlayEmoRef} className="btn" title="试听">
                    <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" fill="currentColor"/></svg>
                    试听
                  </button>
                  <button type="button" onClick={handleRemoveEmoRef} className="btn btn-ghost" title="移除" aria-label="移除情感参考">
                    <svg className="icon-sm" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    移除
                  </button>
                </div>
              </div>
            ) : (
              <>
                <svg className="icon upload-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>点击或拖拽上传情感参考音频</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>支持 MP3, WAV（3-10 秒）</div>
                </div>
              </>
            )}
          </div>

          <div className="bp-item bp-item--compact emo-weight-row">
            <label className="bp-label emo-weight-label">
              <svg className="emo-weight-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4 18h2V6H4v12zm4-6h2V6H8v6zm4 6h2V2h-2v16zm4-10h2V6h-2v2zm0 6h2v-4h-2v4z" />
              </svg>
              情感强度
            </label>
            <div className="slider-container slider-container--soft">
              <div className="slider-progress" style={{ width: `${(Math.min(Math.max(emoWeight, 0), 1.6) / 1.6) * 100}%` }} />
              <input
                type="range"
                className="slider slider--soft"
                role="slider"
                aria-valuemin={0.0}
                aria-valuemax={1.6}
                aria-valuenow={emoWeight}
                min="0.0"
                max="1.6"
                step="0.1"
                value={emoWeight}
                onChange={e => setEmoWeight(parseFloat(e.target.value))}
                aria-label="情感强度"
              />
            </div>
            <span className="bp-val-display emo-weight-value">{emoWeight.toFixed(1)}</span>
            <button type="button" className="emo-reset-btn" onClick={() => setEmoWeight(1.0)} title="重置为 1.0" aria-label="重置情感强度">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              重置
            </button>
          </div>
        </div>
      )}

      {emotionTab === 'text' && (
        <div className="emo-text-wrap emotion-panel">
          <textarea
            className="main-textarea main-textarea--emotion"
            placeholder="输入描述情感的文本 (例如: 开心, 悲伤, 愤怒...)"
            value={emoText}
            onChange={e => setEmoText(e.target.value)}
            maxLength={100}
            aria-label="情感文本描述"
          />
          <div className="textarea-counter">{emoText.length} / 100</div>
        </div>
      )} 

      {emotionTab === 'manual' && (
        <div className="emo-vector-wrap emotion-panel">
          <div className="emo-vector-intro">调整下方各情感滑块以组合所需的情感向量（取值 0.0–1.0）。</div>

          <div className="emotion-grid" role="list">
            {emotionItems.map(item => (
              <div key={item.key} className="emotion-item" role="listitem">
                <div className="emotion-item__head">
                  <div className="emotion-emoji" aria-hidden>{item.emoji}</div>
                  <div className="emotion-title">{item.label}</div>
                </div>
                <div className="emotion-item__row">
                  <div className="slider-container slider-container--emo">
                    <div className="slider-progress" style={{ width: `${(clamp01(emoVector[item.key]) * 100).toFixed(1)}%` }} />
                    <input
                      type="range"
                      className="slider slider--emo"
                      min="0"
                      max="1"
                      step="0.1"
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-valuenow={emoVector[item.key]}
                      value={emoVector[item.key]}
                      onMouseDown={e => e.stopPropagation()}
                      onPointerDown={e => e.stopPropagation()}
                      onChange={e => {
                        const v = clamp01(parseFloat(e.target.value));
                        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                          console.debug('[dev] emoVector change', item.key, v);
                        }
                        setEmoVector({ ...emoVector, [item.key]: v });
                      }}
                      aria-label={item.label + ' 情感强度'}
                      tabIndex={0}
                    />
                  </div>
                  <span className="emotion-value" aria-live="polite">{emoVector[item.key].toFixed(1)}</span>
                  <button type="button" className="emo-reset-btn" title={`重置 ${item.label}`} onClick={() => setEmoVector({ ...emoVector, [item.key]: 0.0 })} aria-label={`重置 ${item.label}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    重置
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="emo-vector-footer">
            <div className="divider" />
            <div className="bp-item bp-item--compact">
              <label className="bp-label">情感权重 <span className="bp-hint">（0.0–1.6，默认 1.0）</span></label>
              <div className="slider-container slider-container--soft">
                <div className="slider-progress" style={{ width: `${(Math.min(Math.max(emoWeight, 0), 1.6) / 1.6) * 100}%` }} />
                <input
                  type="range"
                  className="slider slider--soft"
                  role="slider"
                  aria-valuemin={0.0}
                  aria-valuemax={1.6}
                  aria-valuenow={emoWeight}
                  min="0.0"
                  max="1.6"
                  step="0.1"
                  value={emoWeight}
                  onChange={e => setEmoWeight(parseFloat(e.target.value))}
                  aria-label="情感权重"
                />
              </div>
              <span className="bp-val-display bp-val-display--muted">{emoWeight.toFixed(1)}</span>
              <button type="button" className="emo-reset-btn" onClick={() => setEmoWeight(1.0)} title="重置为 1.0" aria-label="重置情感权重">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                重置
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
