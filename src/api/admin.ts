// 管理后台 API（与后端 /api/admin 路由一致）
import request from './request';

// ============ 邀请码 ============
export interface InviteCodeItem {
  code: string;
  status: string;
  credits_amount: number;
  created_at: string;
  used_at: string | null;
  used_by_id: number | null;
}

/** 生成邀请码（固定 1000 积分），每次 1 个 */
export const generateInviteCode = (): Promise<InviteCodeItem> => {
  return request.get('/api/admin/invite-codes/generate');
};

/** 获取邀请码历史（分页：limit, skip） */
export const getInviteCodes = (params?: { limit?: number; skip?: number }): Promise<InviteCodeItem[]> => {
  return request.get('/api/admin/invite-codes', { params });
};

// ============ 用户管理 ============
export interface AdminUserItem {
  id: number;
  uid: number;
  /** 用户唯一标识，用于充值等接口（优先于主键 id） */
  uuid?: string;
  phone: string;
  username: string | null;
  status: string;
  credits: string;
  credits_expire_at: string | null;
  operations: string[];
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

/** 获取用户列表（keyword=UID或手机号, status_filter=active|frozen, page, size） */
export const getAdminUsers = (params?: {
  keyword?: string;
  status_filter?: string;
  page?: number;
  size?: number;
}): Promise<AdminUsersResponse> => {
  return request.get('/api/admin/users', { params });
};

export interface AdminUserDetail {
  id: number;
  uid: number;
  phone: string;
  username: string | null;
  credits: number;
  credits_expire_at: string | null;
  status: string;
  created_at: string;
  last_login: string | null;
}

/** 获取用户详情 */
export const getAdminUserDetail = (userId: number): Promise<AdminUserDetail> => {
  return request.get(`/api/admin/users/${userId}`);
};

/** 更新用户状态（冻结/解冻）PATCH body: { status: "active" | "frozen" } */
export const updateUserStatus = (userId: number, status: 'active' | 'frozen'): Promise<AdminUserDetail> => {
  return request.patch(`/api/admin/users/${userId}/status`, { status });
};

// ============ 流水记录 ============
export interface AdminTransactionItem {
  created_at: string;
  uid: number;
  user_id: number;
  username: string;
  /** 手机号（后端返回时展示） */
  phone?: string;
  description: string;
  credits_change: string;
  status: string;
}

export interface AdminTransactionsResponse {
  items: AdminTransactionItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

/**
 * 全站流水明细
 * start_date / end_date 格式：YYYY/MM/DD
 * keyword：用户 UID 或手机号
 * transaction_type：synthesis | admin_recharge | refund | invite_code 等
 */
export const getAdminTransactions = (params?: {
  start_date?: string;
  end_date?: string;
  keyword?: string;
  transaction_type?: string;
  page?: number;
  size?: number;
}): Promise<AdminTransactionsResponse> => {
  return request.get('/api/admin/transactions', { params });
};

// ============ 积分管理 ============
/** 管理员为用户充值 POST /api/admin/credits/recharge（优先使用 user_uuid） */
export const rechargeCredits = (data: {
  user_uuid?: string;
  user_id?: number;
  amount: number;
  validity_days?: number;
  description?: string;
}): Promise<{ id: number; user_id: number; amount: number; transaction_type: string; description: string; created_at: string }> => {
  return request.post('/api/admin/credits/recharge', data);
};

export interface AdminCreditTransactionItem {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export interface AdminCreditTransactionsResponse {
  items: AdminCreditTransactionItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

/** 积分流水记录（管理员） */
export const getAdminCreditTransactions = (params?: {
  user_id?: number;
  page?: number;
  size?: number;
}): Promise<AdminCreditTransactionsResponse> => {
  return request.get('/api/admin/credits/transactions', { params });
};
