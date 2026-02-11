/**
 * 本地持久化存储工具
 * 用于缓存用户数据、音色列表等，减少服务器请求
 */

// 缓存键名
export const CACHE_KEYS = {
  USER_INFO: 'tts_user_info',
  VOICES: 'tts_voices',
  HISTORY: 'tts_history',
  SELECTED_VOICE: 'tts_selected_voice',
  THEME: 'theme',
} as const;

// 缓存过期时间（毫秒）
export const CACHE_TTL = {
  USER_INFO: 30 * 60 * 1000,      // 30分钟
  VOICES: 10 * 60 * 1000,        // 10分钟
  HISTORY: 5 * 60 * 1000,         // 5分钟
  SELECTED_VOICE: 24 * 60 * 60 * 1000, // 24小时
} as const;

// 缓存数据结构
interface CacheData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 获取缓存数据
 */
export function getCache<T>(key: string, ttl?: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CacheData<T> = JSON.parse(cached);
    const now = Date.now();
    const cacheAge = now - parsed.timestamp;

    // 检查是否过期
    if (cacheAge > (ttl || 0)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * 设置缓存数据
 */
export function setCache<T>(key: string, data: T, ttl: number): void {
  const cacheData: CacheData<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
}

/**
 * 删除缓存
 */
export function removeCache(key: string): void {
  localStorage.removeItem(key);
}

/**
 * 清除所有TTS相关缓存
 */
export function clearAllCache(): void {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// ==================== 便捷函数 ====================

/**
 * 用户信息缓存
 */
export const userInfoCache = {
  get: () => getCache<any>(CACHE_KEYS.USER_INFO, CACHE_TTL.USER_INFO),
  set: (data: any) => setCache(CACHE_KEYS.USER_INFO, data, CACHE_TTL.USER_INFO),
  remove: () => removeCache(CACHE_KEYS.USER_INFO),
};

/**
 * 音色列表缓存
 */
export const voicesCache = {
  get: () => getCache<any[]>(CACHE_KEYS.VOICES, CACHE_TTL.VOICES),
  set: (data: any[]) => setCache(CACHE_KEYS.VOICES, data, CACHE_TTL.VOICES),
  remove: () => removeCache(CACHE_KEYS.VOICES),
};

/**
 * 生成历史缓存
 */
export const historyCache = {
  get: () => getCache<any[]>(CACHE_KEYS.HISTORY, CACHE_TTL.HISTORY),
  set: (data: any[]) => setCache(CACHE_KEYS.HISTORY, data, CACHE_TTL.HISTORY),
  remove: () => removeCache(CACHE_KEYS.HISTORY),
};

/**
 * 已选音色缓存
 */
export const selectedVoiceCache = {
  get: () => getCache<any>(CACHE_KEYS.SELECTED_VOICE, CACHE_TTL.SELECTED_VOICE),
  set: (data: any) => setCache(CACHE_KEYS.SELECTED_VOICE, data, CACHE_TTL.SELECTED_VOICE),
  remove: () => removeCache(CACHE_KEYS.SELECTED_VOICE),
};

/**
 * 主题缓存
 */
export const themeCache = {
  get: () => localStorage.getItem(CACHE_KEYS.THEME),
  set: (theme: string) => localStorage.setItem(CACHE_KEYS.THEME, theme),
};
