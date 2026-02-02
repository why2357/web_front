// 登录页组件
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationCode, login } from '../../api/auth';
import { getCurrentUser } from '../../api/user';
import './index.css';


function Login() {
  const navigate = useNavigate();
  
  // 表单状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);

  // 生产环境：若 localStorage 有未过期的 token 则自动跳转；开发环境：若配置了 VITE_DEV_TOKEN 则用该 token 拉用户并按角色跳转 /admin 或 /user
  useEffect(() => {
    const env = (import.meta as { env?: { DEV?: boolean; VITE_DEV_TOKEN?: string } }).env;
    if (env?.DEV) {
      const remembered = localStorage.getItem('remembered_phone');
      if (remembered) setPhone(remembered);
      if (env?.VITE_DEV_TOKEN) {
        getCurrentUser()
          .then((userInfo) => {
            if (userInfo.role === 'admin') navigate('/admin');
            else navigate('/user');
          })
          .catch(() => { /* token 无效时留在登录页 */ });
      }
      return;
    }

    const tryAutoLogin = async () => {
      const token = localStorage.getItem('access_token');
      const exp = localStorage.getItem('access_token_expires_at');
      const remembered = localStorage.getItem('remembered_phone');
      if (remembered) setPhone(remembered);

      if (token && exp && Number(exp) > Date.now()) {
        try {
          const userInfo = await getCurrentUser();
          if (userInfo.role === 'admin') navigate('/admin');
          else navigate('/user');
        } catch (err) {
          console.warn('自动登录失败，需重新登录', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('access_token_expires_at');
        }
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
      
      // 保存 token 及过期时间（后端返回 expires_in，单位秒）
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('access_token_expires_at', String(Date.now() + (data.expires_in || 0) * 1000));
      // 根据“记住我”决定是否保存手机号用于下次自动填充
      if (rememberMe) localStorage.setItem('remembered_phone', phone);
      else localStorage.removeItem('remembered_phone');

      console.log('Access Token:', data.access_token); // 打印 token 方便测试
      
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
      <div className="login-card">
        {/* 左侧品牌区 */}
        <div className="brand-section">
          <div className="brand-logo">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">Crea Vedio</span>
          </div>
          
          <h1 className="brand-title">
            Next-Gen<br />
            Audio & Animation
          </h1>
          
          <p className="brand-description">
            一站式视频配音生产引擎，新流全互动媒体创意智能，
            助力游戏开发者创建独特的双向互动体验。
          </p>
          
          <div className="feature-icons">
            <div className="feature-item">
              <span className="feature-icon">🎵</span>
              <span>Audio</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎬</span>
              <span>Video</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <span>API</span>
            </div>
          </div>
          
          <div className="audio-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="form-section">
          <h2 className="form-title">欢迎回来</h2>
          <p className="form-subtitle">使用手机号码快捷登录工作台</p>
          
          <div className="form-body">
            <input
              type="tel"
              className="form-input"
              placeholder="请输入手机号码"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
            />
            
            <div className="code-input-group">
              <input
                type="text"
                className="form-input code-input"
                placeholder="短信验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <button
                className="send-code-btn"
                onClick={handleSendCode}
                disabled={sending || countdown > 0}
              >
                {countdown > 0 ? `${countdown}s` : sending ? '发送中...' : '获取验证码'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                记住我（下次自动填充并尝试自动登录）
              </label>
            </div>
            
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录 / 注册'}
            </button>
            
            <p className="terms">
              登录即同意我们的
              <a href="#"> 服务协议 </a>
              和
              <a href="#"> 隐私政策</a>
            </p>
          </div>
        </div>
      </div>
      
      <footer className="login-footer">
        © 蜂云世界
      </footer>
    </div>
  );
}

export default Login;
