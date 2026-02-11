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
import GeneratedAudioList from './components/GeneratedAudioList';
import FilterModal from './components/FilterModal';

// UI primitives (shared)
import { Button, Modal } from '../../components/ui';

function User() {
  const ui = useUserPage();
  const [cloneDragOver, setCloneDragOver] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // 初始化深色模式
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

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

        <div style={{ flex: 1 }}></div>

        {/* 资源库管理链接 */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); /* TODO: 导航到资源库 */ }}
          style={{ marginRight: 16, fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--primary-light)', borderRadius: 8, transition: 'all 0.2s' }}
        >
          <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          资源库管理
        </a>

        {/* 主题切换 */}
        <div className="theme-toggle" onClick={toggleTheme} title="切换深色模式" style={{ padding: 8, borderRadius: 8, cursor: 'pointer', color: 'var(--text-sub)', transition: 'all 0.2s', marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="icon" viewBox="0 0 24 24">
            {darkMode ? (
              <>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            )}
          </svg>
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
                className={`filter-btn ${ui.filterModalOpen ? 'active' : ''}`}
                onClick={ui.openFilterModal}
              >
                <svg className="icon-sm" viewBox="0 0 24 24">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                筛选
              </button>
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
            {ui.voices.map((v) => {
              // 调试信息：检查 playing 属性的比较逻辑
              const isPlaying = ui.playingVoiceId === v.id;
              console.log('[VoiceCard render] voice:', v.name, 'id:', v.id, 'playingVoiceId:', ui.playingVoiceId, 'isPlaying:', isPlaying);

              return (
                <VoiceCard
                  key={v.id}
                  voice={v}
                  active={ui.selectedVoice?.id === v.id}
                  playing={isPlaying}
                  onSelect={ui.setSelectedVoice}
                  onPreview={(e, voice) => {
                    console.log('[onPreview] voice:', voice.name, 'id:', voice.id, 'type:', typeof voice.id);
                    e.stopPropagation();
                    ui.handlePreviewVoice(voice);
                  }}
                />
              );
            })}
            {ui.loadingVoices && (
              <div className="voice-list-loading">加载中…</div>
            )}
          </div>
        </aside>

        {/* 中间区域 */}
        <section className="panel panel-bg">
          <div className="stage-container">
          <div className="control-card">
            <div className="card-tabs">
              <div className={`tab-btn ${ui.mode === 'library' ? 'active' : ''}`} onClick={() => ui.setMode('library')}>
                <span>使用库音色</span>
              </div>
              <div className={`tab-btn ${ui.mode === 'clone' ? 'active' : ''}`} onClick={() => ui.setMode('clone')}>
                <span>克隆</span>
              </div>
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
                    <div className="emo-ref-ready">
                      <div className="emo-ref-ready-title">
                        {ui.uploadingClone ? '上传中...' : '已选择文件'}
                      </div>
                      <div className="emo-ref-ready-name" title={ui.cloneFile.name}>
                        {ui.cloneFile.name}
                      </div>
                      <div className="emo-ref-ready-actions">
                        <button type="button" onClick={(e) => { e.stopPropagation(); ui.handlePlayCloneRef?.(e); }} className="btn" title="试听">
                          <svg className="icon-sm" viewBox="0 0 24 24" fill="currentColor">
                            {ui.cloneAudioPlaying ? (
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                            ) : (
                              <path d="M5 3l14 9-14 9V3z"></path>
                            )}
                          </svg>
                          {ui.cloneAudioPlaying ? '暂停' : '试听'}
                        </button>
                      </div>
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
                <div className="preset-display fade-in">
                  <div className={`voice-icon ${ui.selectedVoice?.gender === 'male' ? 'v-blue' : ui.selectedVoice?.gender === 'female' ? 'v-pink' : 'v-orange'}`} style={{ width: '48px', height: '48px', borderRadius: '12px' }}>
                    <svg className="icon icon-lg" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                        {ui.selectedVoice?.name || '请选择音色'}
                      </span>
                      {ui.selectedVoice && <span className="preset-badge">当前选择</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                      {ui.selectedVoice ? '已应用该音色配置，点击左侧列表可快速切换。' : '请在左侧选择一个音色'}
                    </div>
                  </div>
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
                emoRefAudioPlaying={ui.emoRefAudioPlaying}
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

          {/* 生成结果音频列表 */}
          <GeneratedAudioList
            audios={ui.generatedAudios}
            playingId={ui.playingAudioId}
            onPlay={ui.handlePlayGeneratedAudio}
            audioProgress={ui.audioProgress}
            currentAudioPlayer={ui.currentAudioPlayer}
          />
          </div>

          {/* 固定底部操作栏 */}
          <div className="fixed-action-bar">
            <div className="action-bar-inner">
              <div className="action-bar">
                <GenerateButton
                  loading={ui.loading}
                  uploadingClone={ui.uploadingClone}
                  uploadingEmo={ui.uploadingEmo}
                  onClick={async () => {
                    try {
                      await ui.handleSubmit();
                    } catch (err: any) {
                      const res = err?.response?.data;
                      const msg =
                        err?.message ||
                        (res && (res.message ?? res.detail ?? res.msg ?? (typeof res.error === 'string' ? res.error : null))) ||
                        (typeof err === 'string' ? err : '合成失败');
                      alert(msg);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 右侧：生成历史 */}
        <aside className="panel">
          <div className="panel-header">
            <span>生成历史</span>
            <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>{ui.history.length}</span>
          </div>
          <div className="history-feed" style={{ padding: '16px' }}>
            <HistoryList history={ui.history} />
          </div>
        </aside>
      </div>

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

      {/* --- Filter Modal --- */}
      <FilterModal
        open={ui.filterModalOpen}
        onClose={ui.closeFilterModal}
        filter={ui.voiceFilter}
        onFilterChange={ui.setVoiceFilter}
        onApply={ui.closeFilterModal}
        onReset={ui.resetVoiceFilter}
      />
    </div>
  );
}

export default User;
