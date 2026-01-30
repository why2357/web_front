// 点数相关 API（对应后端 API 文档第 5 部分）
import request from './request';

// 用户点数余额接口
export interface CreditBalance {
  credits: number;
}

// 获取用户点数余额
export const getCreditBalance = (): Promise<CreditBalance> => {
  return request.get('/api/credits/balance');
};

// 点数交易记录接口
export interface CreditTransaction {
  id: string;
  user_id: string; // 增加 user_id
  type: 'charge' | 'synthesis_cost' | 'refund' | 'system_grant';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

// 获取点数交易记录
export const getCreditTransactions = (params?: {
  page?: number;
  size?: number;
  type?: string;
  user_id?: string; // 增加 user_id
  start_date?: string; // 增加 start_date
  end_date?: string; // 增加 end_date
}): Promise<{ items: CreditTransaction[]; total: number; page: number; size: number; total_pages: number; }> => {
  return request.get('/api/credits/transactions', { params });
};
