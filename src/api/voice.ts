// 音色模板相关 API
import request from './request';

// 音色信息接口 (对应后端 /api/voices/templates)
export interface Voice {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'neutral';
  age_range: string;
  tags: string[];
  category: string;
  style: string[];
  duration: number | null;
  use_count: number;
  created_at: string;
}

/**
 * 获取音色模板列表
 * @param params 查询参数
 * @returns 返回音色模板列表
 */
export const getVoices = async (params?: {
  gender?: string;
  age_range?: string;
  category?: string;
  tags?: string[];
  keyword?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): Promise<Voice[]> => {
  // 后端此接口返回分页数据，这里解包只返回 items 数组以适配现有 UI
  const response: any = await request.get('/api/voices/templates', { params });
  
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && response.items) {
    return response.items;
  }
  
  return [];
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


