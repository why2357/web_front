// 用户页 — 组件化容器（hook + 小组件）
import './index.css';
import { useState, useEffect } from 'react';
import { useUserPage } from './useUserPage';
import VoiceCard from './components/VoiceCard';
import EmotionControls from './components/EmotionControls';
import BasicParams from './components/BasicParams';
import TextComposer from './components/TextComposer';
import GenerateButton from './components/GenerateButton';
import HistoryList from './components/HistoryList';
import AudioPlayer from './components/AudioPlayer';

// UI primitives (shared)
import { Button, Modal } from '../../components/ui';

function User() {
  const ui = useUserPage();
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string; audioUrl?: string; creditsUsed?: number } | null>(null);
  const [cloneDragOver, setCloneDragOver] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!ui.filterOpen) return;
    const close = () => ui.setFilterOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [ui.filterOpen, ui.setFilterOpen]);

  return (
    <div className="user-page">
      {/* 移动端侧边栏遮罩 */}
      {mobileSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <header>
        {/* 移动端汉堡菜单按钮 */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="logo">
          <svg className="icon-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16 16C15.5 17.5 14 18 12 18C10 18 8.5 17.5 8 16C8.5 15.5 10 15 12 15C14 15 15.5 15.5 16 16ZM17 12C17 13.1046 16.1046 14 15 14C13.8954 14 13 13.1046 13 12C13 10.8954 13.8954 10 15 10C16.1046 10 17 10.8954 17 12ZM9 14C7.89543 14 7 13.1046 7 12C7 10.8954 7.89543 10 9 10C10.1046 10 11 10.8954 11 12C11 13.1046 10.1046 14 9 14Z" fill="currentColor"/></svg>
          <span>Crea Vedio</span>
          <span className="logo-badge">Pro 2.0</span>
        </div>
        <div className="user-profile" aria-label="用户信息" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="user-credits">
            <div
              className="credits-pill"
              onClick={(e) => { e.stopPropagation(); ui.openInviteModal(); }}
              role="button"
              aria-label="输入激活码"
              title="点击输入激活码"
            >
              <div className="credits-val">积分: <span>{typeof ui.userInfo?.credits === 'object' ? (ui.userInfo.credits?.balance ?? 0) : (ui.userInfo?.credits ?? 0)}</span></div>
              <div className="credits-exp">
                {(() => {
                  const exp = typeof ui.userInfo?.credits === 'object' && ui.userInfo?.credits && 'expire_at' in ui.userInfo.credits
                    ? (ui.userInfo.credits as { expire_at?: string | null }).expire_at
                    : ui.userInfo?.credits_expire_at;
                  return exp ? `到期: ${exp}` : '点击输入激活码';
                })()}
              </div>
            </div>
          </div>

          <div className="user-sep" aria-hidden="true" />

          <div className="user-avatar-wrapper">
            <img
              className="avatar"
              src={ui.avatarUrl}
              alt={ui.userInfo?.nickname ? ui.userInfo.nickname + ' 的头像' : '默认猫猫头像'}
              onClick={(e) => { e.stopPropagation(); ui.openLogoutConfirm(); }}
              role="button"
              title="点击以退出登录"
            />
          </div>
        </div>
      </header>

      <div className="workspace">
        {/* 左侧：音色库 */}
        <aside className={`panel ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
          <div className="panel-header panel-header--with-filter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3>音色库</h3>
              {/* 移动端关闭按钮 */}
              <button
                className="mobile-sidebar-close"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="关闭"
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="filter-wrap">
              <button
                type="button"
                className={`filter-btn ${ui.filterOpen ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); ui.setFilterOpen(!ui.filterOpen); }}
              >
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M3 6h18M6 12h12m-9 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                筛选
              </button>
              {ui.filterOpen && (
                <div className="filter-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-dropdown-section">
                    <span className="filter-dropdown-label">性别</span>
                    <div className="filter-dropdown-options">
                      {[
                        { value: '', label: '全部' },
                        { value: 'male', label: '男' },
                        { value: 'female', label: '女' },
                      ].map((o) => (
                        <button
                          key={o.value || 'all'}
                          type="button"
                          className={`filter-opt ${ui.voiceFilter.gender === o.value ? 'active' : ''}`}
                          onClick={() => ui.applyVoiceFilter({ gender: o.value })}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="filter-dropdown-section">
                    <span className="filter-dropdown-label">年龄段</span>
                    <div className="filter-dropdown-options">
                      {[
                        { value: '', label: '全部' },
                        { value: 'child', label: '儿童' },
                        { value: 'youth', label: '青年' },
                        { value: 'middle', label: '中年' },
                        { value: 'old', label: '老年' },
                      ].map((o) => (
                        <button
                          key={o.value || 'all'}
                          type="button"
                          className={`filter-opt ${ui.voiceFilter.age_range === o.value ? 'active' : ''}`}
                          onClick={() => ui.applyVoiceFilter({ age_range: o.value })}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            ref={ui.voiceListRef}
            className="voice-list-container"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80 && ui.hasMoreVoices && !ui.loadingVoices) {
                ui.loadMoreVoices();
              }
            }}
          >
            {ui.voices.map((v) => (
              <VoiceCard
                key={v.id}
                voice={v}
                active={ui.selectedVoice?.id === v.id}
                playing={ui.playingVoiceId === String(v.id)}
                onSelect={ui.setSelectedVoice}
                onPreview={(e, voice) => { e.stopPropagation(); ui.handlePreviewVoice(voice); }}
              />
            ))}
            {ui.loadingVoices && (
              <div className="voice-list-loading">加载中…</div>
            )}
          </div>
        </aside>

        {/* 中间：固定高度滚动容器，内容超出即出滚动条 */}
        <div className="stage-scroll">
          <main className="stage-container">
          <div className="control-card">
            <div className="top-tabs">
              <div className={`top-tab ${ui.mode === 'library' ? 'active' : ''}`} onClick={() => ui.setMode('library')}>使用库音色</div>
              <div className={`top-tab ${ui.mode === 'clone' ? 'active' : ''}`} onClick={() => ui.setMode('clone')}>克隆</div>
            </div>

            <div className="card-body">
              {ui.mode === 'clone' ? (
                <div
                  className={`upload-area${cloneDragOver ? ' upload-area--drag-over' : ''}`}
                  onClick={() => ui.cloneInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setCloneDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setCloneDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCloneDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type.startsWith('audio/')) ui.handleCloneUploadFile(file);
                  }}
                >
                  <input type="file" ref={ui.cloneInputRef} style={{ display: 'none' }} accept="audio/*" onChange={ui.handleCloneUpload} />
                  {ui.cloneFile ? (
                    <div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>{ui.uploadingClone ? '上传中...' : '已选择文件'}</div>
                      <div>{ui.cloneFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <svg className="icon upload-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>点击或拖拽上传克隆参考音频</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>支持 MP3, WAV (3-10秒)</div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>
                  {ui.selectedVoice ? (<div>已选择音色：<span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ui.selectedVoice.name}</span></div>) : '请在左侧选择一个音色'}
                </div>
              )}
            </div>
          </div>

          <div className="control-card">
            <div className="card-body">
              <EmotionControls
                emotionTab={ui.emotionTab}
                setEmotionTab={ui.setEmotionTab}
                emoRefFile={ui.emoRefFile}
                emoRefInputRef={ui.emoRefInputRef}
                uploadingEmo={ui.uploadingEmo}
                handleEmoRefUpload={ui.handleEmoRefUpload}
                handleEmoRefUploadFile={ui.handleEmoRefUploadFile}
                handleRemoveEmoRef={ui.handleRemoveEmoRef}
                handlePlayEmoRef={ui.handlePlayEmoRef}
                emoWeight={ui.emoWeight}
                setEmoWeight={ui.setEmoWeight}
                emoText={ui.emoText}
                setEmoText={ui.setEmoText}
                emoVector={ui.emoVector}
                setEmoVector={ui.setEmoVector}
              />
            </div>
          </div>

          <div className="control-card">
            <div className="card-body">
              <BasicParams speed={ui.speed} setSpeed={ui.setSpeed} volume={ui.volume} setVolume={ui.setVolume} />
            </div>
          </div>

          <div className="control-card control-card--composer">
            <div className="card-body card-body--composer">
              <TextComposer text={ui.text} setText={ui.setText} />
            </div>
          </div>
          <div className="composer-actions">
            <GenerateButton
              loading={ui.loading}
              uploadingClone={ui.uploadingClone}
              uploadingEmo={ui.uploadingEmo}
              onClick={async () => {
                setSubmitMessage(null);
                try {
                  const result = await ui.handleSubmit();
                  const res = result && typeof result === 'object' ? result as { audio_url?: string; credits_used?: number } : null;
                  const audioUrl = result && (typeof result === 'string' ? result : res?.audio_url);
                  const creditsUsed = res?.credits_used;
                  setSubmitMessage({
                    type: 'success',
                    text: '语音生成成功，可直接播放或到历史记录中查看',
                    ...(audioUrl ? { audioUrl } : {}),
                    ...(creditsUsed != null ? { creditsUsed } : {}),
                  });
                } catch (err: any) {
                  const res = err?.response?.data;
                  const msg =
                    err?.message ||
                    (res && (res.message ?? res.detail ?? res.msg ?? (typeof res.error === 'string' ? res.error : null))) ||
                    (typeof err === 'string' ? err : '合成失败');
                  setSubmitMessage({ type: 'error', text: msg });
                }
              }}
            />
          </div>
          </main>
        </div>

        {/* 右侧：生成历史 */}
        <aside className="panel">
          <div className="panel-header">
            <h3>生成历史</h3>
          </div>
          <div className="voice-list-container timeline-container" style={{ padding: '20px' }}>
            <HistoryList history={ui.history} />
          </div>
        </aside>
      </div>

      {/* --- 生成结果/错误弹窗：成功时展示音频播放器，可直接播放 --- */}
      {submitMessage && (
        <div className="submit-msg-overlay" onClick={() => setSubmitMessage(null)}>
          <div
            role="alert"
            className={submitMessage.type === 'error' ? 'submit-msg-box submit-msg-box--error' : 'submit-msg-box submit-msg-box--success'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="submit-msg-box__text">{submitMessage.text}</p>
            {submitMessage.type === 'success' && submitMessage.audioUrl && (
              <div className="submit-msg-audio-wrap">
                {submitMessage.creditsUsed != null && (
                  <div className="submit-msg-credits">积分花费：<span>{submitMessage.creditsUsed}</span></div>
                )}
                <AudioPlayer src={submitMessage.audioUrl} className="submit-msg-audio" />
              </div>
            )}
            <button type="button" className="submit-msg-box__btn" onClick={async () => {
              setSubmitMessage(null);
              // 更新用户积分信息
              await ui.loadUserInfo();
            }} style={{ marginTop: 16 }}>
              确定
            </button>
          </div>
        </div>
      )}

      {/* --- Invite code modal --- */}
      <Modal open={ui.inviteModalOpen} onClose={ui.closeInviteModal} title="输入激活码以获取积分" width={420}>
        <div className="modal-card__desc">一个用户可以多次使用激活码，使用后积分会刷新过期时间。</div>

        <div className="modal-card__row">
          <input
            className="modal-input"
            value={ui.inviteCode}
            onChange={(e) => ui.setInviteCode(e.target.value)}
            placeholder="在此输入激活码"
            aria-label="激活码"
          />

          <Button variant="primary" className="modal-btn" onClick={ui.submitInviteCode} loading={ui.inviteSubmitting} disabled={ui.inviteSubmitting}>
            {ui.inviteSubmitting ? '提交中…' : '使用'}
          </Button>
        </div>

        <div style={{ display: 'none' }} />

        {/* footer via prop (keeps markup same as before) */}
        <div className="modal-card__actions">
          <Button variant="cancel" onClick={ui.closeInviteModal}>取消</Button>
        </div>
      </Modal>

      {/* --- Logout confirmation --- */}
      <Modal open={ui.logoutConfirmOpen} onClose={ui.closeLogoutConfirm} title="确定要退出登录吗？" width={360}>
        <div className="modal-card__desc">退出后需要重新登录以继续使用服务。</div>
        <div className="modal-card__actions">
          <Button variant="cancel" onClick={ui.closeLogoutConfirm}>取消</Button>
          <Button variant="danger" onClick={ui.confirmLogout}>退出</Button>
        </div>
      </Modal>
    </div>
  );
}

export default User;
