// 语音合成相关 API (对应 4. 语音合成模块)
import request from './request';

// 注意：此接口定义主要由 history.ts 使用，描述的是历史记录中的任务条目。
// 它与 `generateSpeech` 的直接返回值有所不同。
export interface SynthesisTask {
  id: string;
  text: string;
  voice_id: string;
  voice_name: string;
  speed: number;
  pitch: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url: string | null;
  duration: number | null;
  cost_credits: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

// 4.1 生成语音的请求体
export interface GenerateSpeechPayload {
  text_content: string;
  voice_template_id?: number | string;
  custom_voice_id?: number;
  emo_control_method: number;
  emo_weight?: number;
  speed?: number;
  volume_scale?: number;
  max_text_tokens_per_sentence?: number;
  emo_audio?: string;
  /**
   * 情感向量（数组形式），顺序为 [joy, anger, sadness, calm]，每项 0.0 - 1.0
   */
  emo_vec?: number[];
  emo_text?: string;
}

// 4.1 生成语音的成功响应体 (data部分)
export interface SynthesisResult {
  id: number;
  audio_url: string;
  file_size: number;
  duration: number;
  credits_used: number;
  created_at: string;
}

/**
 * 4.1 生成语音
 * @param data 请求参数
 * @returns 返回生成结果
 */
export const generateSpeech = (data: GenerateSpeechPayload): Promise<SynthesisResult> => {
  return request.post('/api/synthesis/generate', data);
};

// 4.2 上传情感参考音频的响应体 (data部分)
export interface EmotionReference {
    emo_audio_identifier: string;
    emo_audio: string;
    file_size: number;
    is_duplicate: boolean;
    md5: string;
}

/**
 * 4.2 上传情感参考音频
 * @param audioFile 音频文件
 * @returns 返回上传结果
 */
export const uploadEmotionReference = (audioFile: File): Promise<EmotionReference> => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    return request.post('/api/synthesis/upload-emotion-reference', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
