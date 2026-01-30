import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, UserInfo } from '../../api/user';
import { getVoices, Voice, uploadCustomVoice } from '../../api/voice';
import { generateSpeech, uploadEmotionReference } from '../../api/synthesis';
import { getSynthesisHistory } from '../../api/history';
import { logout } from '../../api/auth';

// --- 开发辅助：方便在本地覆盖/清理 token（仅用于本地调试） ---
export function __dev_setToken(token: string, expiresMs = 1000 * 60 * 60 * 24 * 365) {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('access_token_expires_at', String(Date.now() + expiresMs));
  }
}
export function __dev_clearToken() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expires_at');
  }
}


export function useUserPage() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 生成可变种子猫头像（不直接泄露原始 user id / nickname）
  const seedFrom = (v?: string | number | null) => {
    const s = String(v ?? 'guest');
    // 简单 DJB2-like hash → 可读短串，确定性且不直露原始值
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
    const short = (h >>> 0).toString(36).slice(0, 8);
    return `cat-${short}`;
  };

  const avatarSeed = userInfo ? seedFrom(userInfo.id || userInfo.nickname) : 'cat-guest';
  const avatarUrl = userInfo?.avatar || `https://robohash.org/${encodeURIComponent(avatarSeed)}?set=set4&size=128x128`;
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [customVoiceId, setCustomVoiceId] = useState<number | null>(null);
  const cloneInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const [mode, setMode] = useState<'library' | 'clone'>('library');
  const [emotionTab, setEmotionTab] = useState('default');

  const [emoRefFile, setEmoRefFile] = useState<File | null>(null);
  const [emoAudioId, setEmoAudioId] = useState<string | null>(null);
  const [emoWeight, setEmoWeight] = useState(1.0);
  const emoRefInputRef = useRef<HTMLInputElement>(null);
  const [emoText, setEmoText] = useState('');

  // 情感向量（扩展为 8 维：joy, disgust, anger, low, sadness, surprise, fear, calm）
  const [emoVector, setEmoVector] = useState({ joy: 0.0, disgust: 0.0, anger: 0.0, low: 0.0, sadness: 0.0, surprise: 0.0, fear: 0.0, calm: 0.0 });

  const [history, setHistory] = useState<any[]>([]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingClone, setUploadingClone] = useState(false);
  const [uploadingEmo, setUploadingEmo] = useState(false);

  // --- 激活码 / 积分 UI ---
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  // --- 登出二次确认 ---
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);


  useEffect(() => {
    loadUserInfo();
    loadVoices();
    loadHistory();
    // cleanup audio on unmount
    return () => {
      audioPlayer?.pause();
      setAudioPlayer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 激活码相关操作 ---
  const openInviteModal = () => {
    setInviteCode('');
    setInviteModalOpen(true);
  };
  const closeInviteModal = () => setInviteModalOpen(false);
  const submitInviteCode = async () => {
    if (!inviteCode.trim()) {
      alert('请输入激活码');
      return;
    }
    try {
      setInviteSubmitting(true);
      // lazy import to avoid circular deps in some setups
      const { useInviteCode } = await import('../../api/auth');
      const res = await useInviteCode(inviteCode.trim());
      // 刷新用户信息并提示
      await loadUserInfo();
      alert(`激活成功，当前积分：${res.credits}`);
      closeInviteModal();
    } catch (err: any) {
      console.error('使用激活码失败', err);
      alert(err?.message || '激活码使用失败');
    } finally {
      setInviteSubmitting(false);
    }
  };

  // --- 登出确认 ---
  const openLogoutConfirm = () => setLogoutConfirmOpen(true);
  const closeLogoutConfirm = () => setLogoutConfirmOpen(false);
  const confirmLogout = async () => {
    closeLogoutConfirm();
    await handleLogout();
  };

  const loadUserInfo = async () => {
    try {
      const data = await getCurrentUser();
      setUserInfo(data);
    } catch (err) {
      console.error('获取用户信息失败', err);
    }
  };

  const loadVoices = async () => {
    try {
      const data = await getVoices();
      setVoices(data);
      if (data.length > 0) setSelectedVoice(data[0]);
    } catch (err) {
      console.error('获取音色列表失败', err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getSynthesisHistory({ page: 1, size: 20 }); // 后端 PaginationParams 若为 limit/offset 可改为 { limit: 20, offset: 0 }
      setHistory(data.items || []);
    } catch (err) {
      console.error('获取历史记录失败', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_token_expires_at');
      navigate('/login');
    } catch (err) {
      console.error('退出失败', err);
    }
  };

  const handleCloneUploadFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    setCloneFile(file);
    setUploadingClone(true);
    try {
      const res = await uploadCustomVoice({
        name: file.name.replace(/\.[^/.]+$/, ''),
        audio_file: file,
      });
      setCustomVoiceId(res.id);
    } catch (err: any) {
      console.error('上传克隆音频失败', err);
      setCloneFile(null);
      throw err;
    } finally {
      setUploadingClone(false);
    }
  };

  const handleCloneUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleCloneUploadFile(e.target.files[0]);
  };

  const handleEmoRefUploadFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    setEmoRefFile(file);
    setUploadingEmo(true);
    try {
      const res = await uploadEmotionReference(file);
      setEmoAudioId(res.emo_audio_identifier || res.emo_audio);
    } catch (err: any) {
      console.error('上传情感参考失败', err);
      setEmoRefFile(null);
      throw err;
    } finally {
      setUploadingEmo(false);
    }
  };

  const handleEmoRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleEmoRefUploadFile(e.target.files[0]);
  };

  const handleRemoveEmoRef = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmoRefFile(null);
    setEmoAudioId(null);
    if (emoRefInputRef.current) emoRefInputRef.current.value = '';
  };

  const handlePlayEmoRef = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (emoRefFile) {
      const url = URL.createObjectURL(emoRefFile);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!text.trim()) throw new Error('请输入文本内容');
      if (mode === 'library' && !selectedVoice) throw new Error('请选择音色');
      if (mode === 'clone' && !customVoiceId) throw new Error('请先上传克隆参考音频');

      let emoMethod = 0;
      if (emotionTab === 'default') emoMethod = 0;
      else if (emotionTab === '情感参考') emoMethod = 1;
      else if (emotionTab === '情感向量') emoMethod = 2;
      else if (emotionTab === '情感文本') emoMethod = 3;

      const result = await generateSpeech({
        text_content: text,
        voice_template_id: mode === 'library' ? selectedVoice?.id : undefined,
        custom_voice_id: mode === 'clone' && customVoiceId ? customVoiceId : undefined,
        emo_control_method: emoMethod,
        emo_audio: (emotionTab === '情感参考' && emoAudioId) ? emoAudioId : undefined,
        emo_text: (emotionTab === '情感文本' && emoText) ? emoText : undefined,
        // 后端现在期望收到数组形式的情感向量（emo_vec），按顺序：joy, anger, sadness, calm
        emo_vec: emotionTab === '情感向量' ? [
          emoVector.joy,
          emoVector.disgust,
          emoVector.anger,
          emoVector.low,
          emoVector.sadness,
          emoVector.surprise,
          emoVector.fear,
          emoVector.calm,
        ] : undefined,
        // ensure emo_weight respects backend constraints (0.0 - 1.6)
        emo_weight: Math.min(1.6, Math.max(0.0, emoWeight)),
        speed,
        volume_scale: volume,
      });

      await loadHistory();
      // 返回结果，供页面展示播放器（接口只返回音频 url，需能直接播放）
      return result;
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewVoice = async (voice: Voice, onPlay?: (url: string) => void) => {
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
      setPlayingVoiceId(null);
      if (playingVoiceId === voice.id) return;
    }

    try {
      const previewText = '你好，欢迎使用文字转语音功能。';
      const result = await generateSpeech({ text_content: previewText, voice_template_id: voice.id, emo_control_method: 0, speed: 1.0 });
      if (result?.audio_url) {
        const newAudio = new Audio(result.audio_url);
        setAudioPlayer(newAudio);
        setPlayingVoiceId(voice.id);
        newAudio.play();
        newAudio.onended = () => {
          setPlayingVoiceId(null);
          setAudioPlayer(null);
        };
        onPlay?.(result.audio_url);
      }
    } catch (err) {
      console.error('试听失败', err);
      throw err;
    }
  };

  return {
    // data
    userInfo,
    avatarUrl,
    voices,
    selectedVoice,
    setSelectedVoice,
    history,
    // refs
    cloneInputRef,
    emoRefInputRef,
    // ui state
    mode,
    setMode,
    emotionTab,
    setEmotionTab,
    // form
    text,
    setText,
    speed,
    setSpeed,
    volume,
    setVolume,
    // uploads
    cloneFile,
    customVoiceId,
    emoRefFile,
    emoAudioId,
    emoWeight,
    setEmoWeight,
    emoText,
    setEmoText,
    // 情感向量
    emoVector,
    setEmoVector,
    // status
    loading,
    uploadingClone,
    uploadingEmo,
    playingVoiceId,
    // actions
    loadVoices,
    loadHistory,
    handleLogout,
    handleCloneUpload,
    handleCloneUploadFile,
    handleEmoRefUpload,
    handleEmoRefUploadFile,
    handleRemoveEmoRef,
    handlePlayEmoRef,
    handleSubmit,
    handlePreviewVoice,
    // invite code / logout confirm
    inviteModalOpen,
    openInviteModal,
    closeInviteModal,
    inviteCode,
    setInviteCode,
    inviteSubmitting,
    submitInviteCode,
    logoutConfirmOpen,
    openLogoutConfirm,
    closeLogoutConfirm,
    confirmLogout,
  } as const;
}
