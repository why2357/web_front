// 用户信息相关 API（对应后端 API 文档第 2 部分）
import request from './request';

// 积分对象（后端可能返回对象或数字）
export interface CreditsInfo {
  balance: number;
  total_earned?: number;
  total_spent?: number;
  expire_at?: string | null;
}

// 用户信息接口（/api/auth/me 返回，含积分与过期时间）
export interface UserInfo {
  id: string;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  /** 积分：后端可能返回数字或对象 { balance, total_earned, total_spent, expire_at } */
  credits: number | CreditsInfo;
  /** 积分到期时间，来自 /api/auth/me（或 credits.expire_at） */
  credits_expire_at?: string | null;
  status: 'active' | 'frozen';
  role: 'user' | 'admin';
  created_at: string;
  last_login_at: string;
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<UserInfo> => {
  return request.get('/api/auth/me');
};

// 更新用户信息
export const updateUserInfo = (data: {
  nickname?: string;
  avatar?: string;
}): Promise<UserInfo> => {
  return request.put('/api/user/me', data);
};
