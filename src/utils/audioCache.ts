/**
 * 音频文件本地缓存工具 (基于 IndexedDB)
 * 用于缓存历史记录中的音频，避免重复请求服务器
 */

const DB_NAME = 'TTS_Audio_Cache';
const DB_VERSION = 1;
const STORE_NAME = 'audios';

interface CachedAudio {
  id: string;              // 音频 ID（通常是 history ID）
  url: string;             // 原始 URL
  blob: Blob;              // 音频二进制数据
  mimeType: string;        // MIME 类型
  createdAt: number;       // 缓存时间戳
  expiresAt: number;       // 过期时间戳
}

class AudioCache {
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * 缓存音频文件
   * @param id 音频 ID
   * @param url 音频 URL
   * @param ttl 缓存有效期（毫秒），默认 7 天
   */
  async set(id: string, url: string, ttl: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
          return response.blob();
        })
        .then(blob => {
          const now = Date.now();
          const cachedAudio: CachedAudio = {
            id,
            url,
            blob,
            mimeType: blob.type,
            createdAt: now,
            expiresAt: now + ttl,
          };

          const request = store.put(cachedAudio);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
        .catch(reject);
    });
  }

  /**
   * 获取缓存的音频 Blob URL
   * @param id 音频 ID
   * @returns Blob URL 或 null
   */
  async get(id: string): Promise<string | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const cachedAudio = request.result as CachedAudio | undefined;
        if (!cachedAudio) {
          resolve(null);
          return;
        }

        // 检查是否过期
        if (cachedAudio.expiresAt < Date.now()) {
          this.delete(id).catch(console.error);
          resolve(null);
          return;
        }

        // 创建 Blob URL
        const blobUrl = URL.createObjectURL(cachedAudio.blob);
        resolve(blobUrl);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除缓存的音频
   * @param id 音频 ID
   */
  async delete(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清理过期的缓存
   */
  async cleanExpired(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiresAt');
      const now = Date.now();
      const request = index.openCursor(IDBKeyRange.upperBound(now));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取缓存大小（字节）
   */
  async getSize(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const cachedAudios = request.result as CachedAudio[];
        const totalSize = cachedAudios.reduce((sum, audio) => sum + audio.blob.size, 0);
        resolve(totalSize);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取格式化的缓存大小
   */
  async getFormattedSize(): Promise<string> {
    const bytes = await this.getSize();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * 获取缓存数量
   */
  async getCount(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例
export const audioCache = new AudioCache();

/**
 * 辅助函数：获取或加载音频（优先从缓存）
 * @param id 音频 ID
 * @param url 音频 URL
 * @returns Blob URL
 */
export async function getOrLoadAudio(id: string, url: string): Promise<string> {
  // 先尝试从缓存获取
  const cachedUrl = await audioCache.get(id);
  if (cachedUrl) {
    return cachedUrl;
  }

  // 缓存不存在，从网络加载并缓存
  await audioCache.set(id, url);
  return await audioCache.get(id) as string;
}
