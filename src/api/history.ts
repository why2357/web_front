// 历史记录相关 API（对应后端 API 文档第 6 部分）
import request from './request';
import { SynthesisTask } from './synthesis';

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// 获取语音合成历史记录（后端：GET /api/history/synthesis，PaginationParams 一般为 limit/offset 或 page/size）
export const getSynthesisHistory = (params?: {
  page?: number;
  size?: number;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<SynthesisTask>> => {
  const { page = 1, size = 20, limit, offset } = params || {};
  const query = limit != null && offset != null ? { limit, offset } : { page, size };
  return request.get('/api/history/synthesis', { params: query });
};

// 获取单条历史的音频下载/播放链接（GET /api/history/{id}/download-url）
export const getHistoryDownloadUrl = (historyId: number | string, expires?: number): Promise<{ download_url: string; expires_in?: number }> => {
  return request.get(`/api/history/${historyId}/download-url`, { params: expires != null ? { expires } : {} });
};
