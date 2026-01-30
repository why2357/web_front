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

// 使用邀请码（输入邀请码获取积分）
export const useInviteCode = (invite_code: string): Promise<{ credits: number; expires_at?: string; activated?: boolean }> => {
  return request.post('/api/auth/use-invite-code', { invite_code });
};
