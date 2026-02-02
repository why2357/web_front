// 音色模板相关 API
import request from './request';

// 音色信息接口 (对应后端 /api/voices/templates)
export interface Voice {
  id: string | number;
  name: string;
  description: string;
  avatar_url: string | null;
  /** 试听音频地址，有则直接播放，无需调生成接口 */
  audio_url?: string | null;
  gender: 'male' | 'female' | 'neutral';
  age_range: string;
  tags: string[];
  category: string;
  style: string[];
  duration: number | null;
  use_count: number;
  created_at: string;
}

export interface VoicesPageResult {
  items: Voice[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 获取音色模板列表（分页，用于无限滚动）
 */
export const getVoicesPage = async (params: {
  page?: number;
  page_size?: number;
  gender?: string;
  age_range?: string;
  category?: string;
  tags?: string[];
  keyword?: string;
  sort_by?: string;
}): Promise<VoicesPageResult> => {
  const { page = 1, page_size = 20, ...rest } = params;
  const response: any = await request.get('/api/voices/templates', {
    params: { page, page_size, ...rest },
  });

  if (Array.isArray(response)) {
    return { items: response, total: response.length, page: 1, page_size: response.length, total_pages: 1 };
  }
  if (response && response.items) {
    return {
      items: response.items,
      total: response.total ?? response.items.length,
      page: response.page ?? 1,
      page_size: response.page_size ?? response.items.length,
      total_pages: response.total_pages ?? 1,
    };
  }
  return { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
};

/**
 * 获取音色模板列表（兼容旧用法，只返回第一页）
 */
export const getVoices = async (params?: Parameters<typeof getVoicesPage>[0]): Promise<Voice[]> => {
  const result = await getVoicesPage({ ...params, page: 1, page_size: params?.page_size ?? 20 });
  return result.items;
};

// 自定义音色接口
export interface CustomVoice {
  id: number;
  name: string;
  description: string;
  file_size: number;
  duration: number;
  is_duplicate: boolean;
  created_at: string;
}

/**
 * 上传自定义音色 (克隆)
 * @param data 包含 name, description, audio_file
 */
export const uploadCustomVoice = (data: {
  name: string;
  description?: string;
  audio_file: File;
}): Promise<CustomVoice> => {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('audio_file', data.audio_file);

  return request.post('/api/voices/custom', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取自定义音色列表
 */
export const getCustomVoices = (): Promise<CustomVoice[]> => {
  return request.get('/api/voices/custom');
};


