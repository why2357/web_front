// 登录页组件
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationCode, login, getLogoutFlag } from '../../api/auth';
import { getCurrentUser } from '../../api/user';
import './index.css';

/**
 * 从 JWT token 中提取过期时间（秒级时间戳）
 * 自动处理后端错误使用毫秒级时间戳的情况
 */
function getJwtExpiration(token: string): number {
  try {
    // JWT 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[JWT] token 格式错误');
      return Date.now() / 1000 + 3600; // 默认 1 小时后过期
    }

    // Base64URL 解码
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // 补全 padding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

    // 解码并解析 JSON
    const decoded = atob(paddedPayload);
    const parsed = JSON.parse(decoded);

    let exp = parsed.exp;

    // 检测并修正时间戳格式
    // 如果 exp > 1000000000000，说明是毫秒级时间戳，需要转换为秒级
    if (exp > 1000000000000) {
      console.warn('[JWT] 检测到毫秒级时间戳，自动转换为秒级');
      exp = Math.floor(exp / 1000);
    }

    console.log('[JWT] 解码成功，exp:', exp, '(', new Date(exp * 1000).toLocaleString('zh-CN'), ')');
    return exp;
  } catch (err) {
    console.error('[JWT] 解码失败:', err);
    // 解码失败，使用默认过期时间（1 小时后）
    return Math.floor(Date.now() / 1000) + 3600;
  }
}


function Login() {
  const navigate = useNavigate();
  
  // 表单状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);
//  localStorage.setItem('access_token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOTg0MDkwOTA1NSIsImV4cCI6MTc3Mjc5MDA2MX0.RnYJMOVDOAnO0KoiMNfOdFFUdwqeckmxcxHjdL6rBsc");
// //  localStorage.setItem('access_token_expires_at', "1872790061000");
//    localStorage.setItem('remembered_phone', "19837335826");
  

//  localStorage.setItem('access_token_expires_at', "1872790061000");
//    localStorage.setItem('remembered_phone', "13391229172");
//  localStorage.setItem('access_token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM5MTIyOTE3MiIsImV4cCI6MTc3MjY3NjUwOX0.QE-ApHWvIUWpEZOmtexSTA_CFzc96VyBpC2mC58PfiI");
  
      // localStorage.setItem('access_token', data.access_token);
  // 自动登录：优先使用 localStorage 中的 token，开发环境下如果没有才使用 VITE_DEV_TOKEN
  useEffect(() => {
    console.log('[Login] ==================== useEffect 触发 ====================');
    console.log('[Login] 当前 localStorage 全部数据:', {...localStorage});
    console.log('[Login] access_token:', localStorage.getItem('access_token'));
    console.log('[Login] access_token_expires_at:', localStorage.getItem('access_token_expires_at'));
    console.log('[Login] just_logged_out:', localStorage.getItem('just_logged_out'));
    console.log('[Login] VITE_DEV_TOKEN:', (import.meta as { env?: { DEV?: boolean; VITE_DEV_TOKEN?: string } }).env?.VITE_DEV_TOKEN);

    const env = (import.meta as { env?: { DEV?: boolean; VITE_DEV_TOKEN?: string } }).env;
    const remembered = localStorage.getItem('remembered_phone');
    if (remembered) setPhone(remembered);

    // 检查是否刚退出登录
    if (getLogoutFlag()) {
      console.log('[Login] 检测到刚退出登录标记，跳过自动登录');
      return;
    }

    const tryAutoLogin = async () => {
      console.log('[Login] 开始自动登录检查');
      // 优先使用 localStorage 中的 token
      const token = localStorage.getItem('access_token');
      const exp = localStorage.getItem('access_token_expires_at');
      const graceMs = 5000;  // 5秒宽限期，与 request.ts 保持一致

      console.log('[Login] token:', token ? '存在' : '不存在');
      console.log('[Login] exp:', exp);
      console.log('[Login] 剩余时间（毫秒）:', exp ? Number(exp) - Date.now() : '无过期时间');

      // 如果 localStorage 中有有效 token（与 request.ts 逻辑一致，使用宽限期）
      if (token && exp && Number(exp) - Date.now() > -graceMs) {
        console.log('[Login] localStorage token 有效，尝试获取用户信息');
        try {
          const userInfo = await getCurrentUser();
          console.log('[Login] 获取用户信息成功:', userInfo);
          if (userInfo.role === 'admin') navigate('/admin');
          else navigate('/user');
          return;
        } catch (err) {
          console.warn('[Login] localStorage token 无效，清除', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('access_token_expires_at');
        }
      } else {
        console.log('[Login] localStorage token 无效或不存在');
      }

      // 开发环境下，如果没有有效的 localStorage token，使用 VITE_DEV_TOKEN
      if (env?.DEV && env?.VITE_DEV_TOKEN) {
        console.log('[Login] 开发环境，尝试使用 VITE_DEV_TOKEN');
        try {
          const userInfo = await getCurrentUser();
          console.log('[Login] VITE_DEV_TOKEN 有效:', userInfo);
          if (userInfo.role === 'admin') navigate('/admin');
          else navigate('/user');
        } catch (err) {
          console.warn('[Login] VITE_DEV_TOKEN 无效，需手动登录', err);
        }
      } else {
        console.log('[Login] 没有可用的自动登录方式，停留在登录页');
      }
    };

    tryAutoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 发送验证码
  const handleSendCode = async () => {
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    try {
      setSending(true);
      await sendVerificationCode(phone);
      alert('验证码已发送');
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      alert(error.message || '发送失败');
    } finally {
      setSending(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!phone || !code) {
      alert('请输入手机号和验证码');
      return;
    }

    try {
      setLoading(true);
      const data = await login(phone, code);

      // 解码 JWT token 获取正确的过期时间
      const tokenExp = getJwtExpiration(data.access_token);
      const expiresAt = tokenExp * 1000; // 转换为毫秒

      // 保存 token 及过期时间
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('access_token_expires_at', String(expiresAt));

      console.log('Access Token:', data.access_token);
      console.log('Token 过期时间:', new Date(expiresAt));

      // 根据"记住我"决定是否保存手机号用于下次自动填充
      if (rememberMe) localStorage.setItem('remembered_phone', phone);
      else localStorage.removeItem('remembered_phone');
      
      // 获取用户信息，判断角色
      const userInfo = await getCurrentUser();
      
      // 根据角色跳转
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error: any) {
      alert(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 背景装饰光斑 */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* 导航栏 */}
      <nav className="navbar">
        <a href="#" className="nav-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span className="logo-gradient-text">Crea Vedio</span>
        </a>
      </nav>

      {/* 主内容区 */}
      <div className="main-container">
        <div className="hero-wrapper">
          {/* 装饰线条 */}
          <div className="deco-line line-1"></div>
          <div className="deco-line line-2"></div>
          <div className="circle-big"></div>
          <div className="sound-wave">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>

          {/* 左侧品牌区 */}
          <div className="hero-left">
            <div className="tag-pill">✨ 全新 PaaS 平台上线</div>
            <h1>Next-Gen<br />Audio & Animation</h1>
            <p>
              一站式智能内容生产引擎。集成全生命周期音频管理、实时语音克隆，赋能开发者构建极致创意应用。
            </p>

            <div className="feature-icons">
              <div className="f-item">
                <div className="icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  </svg>
                </div>
                <span>Audio</span>
              </div>
              <div className="f-item">
                <div className="icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                  </svg>
                </div>
                <span>Video</span>
              </div>
              <div className="f-item">
                <div className="icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </div>
                <span>API</span>
              </div>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div className="hero-right">
            <div className="login-card">
              <div className="login-header">
                <h3>欢迎回来</h3>
                <p>使用手机号码快捷登录工作台</p>
              </div>

              <input
                type="tel"
                className="input-field"
                placeholder="请输入手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
              />

              <div className="input-group verify-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="短信验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
                <button
                  className="btn-code"
                  onClick={handleSendCode}
                  disabled={sending || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s后重发` : sending ? '发送中...' : '获取验证码'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  记住我（下次自动填充并尝试自动登录）
                </label>
              </div>

              <button
                className={`btn-submit${loading ? ' loading' : ''}`}
                onClick={handleLogin}
                disabled={loading}
              >
                <span>{loading ? '' : '登录 / 注册'}</span>
              </button>

              <div className="agreement">
                登录即代表您同意 <a href="#">服务条款</a> 与 <a href="#">隐私政策</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer-fixed">
        <div>© 2026 Crea Vedio Inc. Powered by Intelligent Engine.</div>
        <div className="icp-link">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            沪ICP备2025150536号-1
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Login;
