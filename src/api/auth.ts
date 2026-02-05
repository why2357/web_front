// 认证相关 API（对应后端 API 文档第 1 部分）
import request from './request';

// 发送短信验证码
export const sendVerificationCode = (phone: string) => {
  return request.post('/api/auth/send-code', {
    phone,
    purpose: 'login',
  });
};

// 登录响应接口
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// 登录
export const login = (phone: string, code: string): Promise<LoginResponse> => {
  return request.post('/api/auth/login', {
    phone,
    code,
  });
};

// 登出 (纯前端实现)
export const logout = () => {
  // 由于后端没有登出接口，这里直接返回一个 resolved Promise
  // 具体的 token 删除和页面跳转由调用方处理
  return Promise.resolve();
};

// 设置退出登录标记（防止开发环境自动登录）
export const setLogoutFlag = () => {
  sessionStorage.setItem('just_logged_out', Date.now().toString());
};

// 检查是否刚退出登录（5秒内有效）
export const getLogoutFlag = (): boolean => {
  const flag = sessionStorage.getItem('just_logged_out');
  if (flag) {
    const logoutTime = parseInt(flag, 10);
    const now = Date.now();
    // 5秒内的退出标记才有效
    if (now - logoutTime < 5000) {
      return true;
    }
    sessionStorage.removeItem('just_logged_out');
  }
  return false;
};

// 使用邀请码（输入邀请码获取积分）
export const useInviteCode = (invite_code: string): Promise<{ credits: number; expires_at?: string; activated?: boolean }> => {
  return request.post('/api/auth/use-invite-code', { invite_code });
};
