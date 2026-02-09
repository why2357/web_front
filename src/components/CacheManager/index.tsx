/**
 * 缓存管理组件
 * 用于显示和管理本地音频缓存
 */
import { useState, useEffect } from 'react';
import { audioCache } from '../../utils/audioCache';
import { Modal } from '../ui';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CacheManager({ open, onClose }: Props) {
  const [size, setSize] = useState<string>('-');
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCacheInfo();
    }
  }, [open]);

  const loadCacheInfo = async () => {
    setLoading(true);
    try {
      const [formattedSize, itemCount] = await Promise.all([
        audioCache.getFormattedSize(),
        audioCache.getCount(),
      ]);
      setSize(formattedSize);
      setCount(itemCount);
    } catch (e) {
      console.error('加载缓存信息失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('确定要清空所有本地缓存吗？这不会删除服务器上的音频文件。')) {
      return;
    }

    setLoading(true);
    try {
      await audioCache.clear();
      setSize('-');
      setCount(0);
      alert('缓存已清空');
    } catch (e: any) {
      console.error('清空缓存失败', e);
      alert(e?.message || '清空缓存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanExpired = async () => {
    setLoading(true);
    try {
      await audioCache.cleanExpired();
      await loadCacheInfo();
      alert('过期缓存已清理');
    } catch (e: any) {
      console.error('清理过期缓存失败', e);
      alert(e?.message || '清理失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="音频缓存管理">
      <div style={{ padding: '20px', minWidth: '300px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>缓存大小:</span>
            <span style={{ fontWeight: 600 }}>{loading ? '计算中...' : size}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>缓存数量:</span>
            <span style={{ fontWeight: 600 }}>{loading ? '计算中...' : count}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCleanExpired}
            disabled={loading}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.borderColor = '#6366f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            清理过期缓存
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={loading}
            style={{
              padding: '10px 16px',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              background: '#fff',
              color: '#ef4444',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            清空所有缓存
          </button>
        </div>

        <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
          本地缓存可以加快音频播放速度，避免重复下载。缓存会自动过期（默认 7 天）。
        </p>
      </div>
    </Modal>
  );
}
