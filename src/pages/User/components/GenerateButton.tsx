type Props = {
  loading: boolean;
  uploadingClone: boolean;
  uploadingEmo: boolean;
  onClick: () => void | Promise<void>;
};

export default function GenerateButton({ loading, uploadingClone, uploadingEmo, onClick }: Props) {
  const disabled = loading || uploadingClone || uploadingEmo;
  const label = uploadingClone || uploadingEmo ? '上传中…' : loading ? '生成中…' : '立即生成';

  return (
    <button
      type="button"
      className="generate-btn"
      onClick={() => onClick()}
      disabled={disabled}
      aria-busy={loading}
    >
      {label}
    </button>
  );
}
