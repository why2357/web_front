import { useEffect } from 'react';

export type VoiceFilter = {
  gender: string;
  age_range: string;
  categories: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  filter: VoiceFilter;
  onFilterChange: (filter: VoiceFilter) => void;
  onApply: () => void;
  onReset: () => void;
};

const GENDER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
];

const AGE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'child', label: '儿童' },
  { value: 'youth', label: '青年' },
  { value: 'middle', label: '中年' },
  { value: 'old', label: '老年' },
];

const CATEGORY_OPTIONS = [
  '游戏与RPG',
  '广播剧',
  '有声书与小说',
  '动漫与动画',
  '角色配音',
  '纪录片',
  '广告与预告',
  '在线教育',
  '播客与社媒',
  '企业宣传与旁白',
];

export default function FilterModal({ open, onClose, filter, onFilterChange, onApply, onReset }: Props) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleGenderSelect = (value: string) => {
    onFilterChange({ ...filter, gender: value });
  };

  const handleAgeToggle = (value: string) => {
    onFilterChange({ ...filter, age_range: filter.age_range === value ? '' : value });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filter.categories.includes(category)
      ? filter.categories.filter(c => c !== category)
      : [...filter.categories, category];
    onFilterChange({ ...filter, categories: newCategories });
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header">
          <div className="filter-modal-title">语音过滤器</div>
          <div className="filter-modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="filter-modal-content">
          {/* 性别 */}
          <div className="filter-group">
            <div className="filter-group-title">性别</div>
            <div className="segmented-control">
              {GENDER_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`seg-item ${filter.gender === option.value ? 'active' : ''}`}
                  onClick={() => handleGenderSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* 年龄段 */}
          <div className="filter-group">
            <div className="filter-group-title">年龄段</div>
            <div className="filter-tags">
              {AGE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`filter-tag ${filter.age_range === option.value ? 'active' : ''}`}
                  onClick={() => handleAgeToggle(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {/* 类别 */}
          <div className="filter-group">
            <div className="filter-group-title">类别</div>
            <div className="filter-tags">
              {CATEGORY_OPTIONS.map((category) => (
                <div
                  key={category}
                  className={`filter-tag ${filter.categories.includes(category) ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal-footer">
          <button className="btn-reset" onClick={onReset}>
            重置所有
          </button>
          <button className="btn-confirm" onClick={onApply}>
            筛选
          </button>
        </div>
      </div>
    </div>
  );
}
