type Props = {
  text: string;
  setText: (s: string) => void;
};

export default function TextComposer({ text, setText }: Props) {
  return (
    <div className="composer-inner">
      <textarea
        className="main-textarea"
        placeholder="在此输入您想要生成的文本内容..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={300}
      />
      <div className="composer-bar">
        <span className="composer-count">{text.length} / 300</span>
      </div>
    </div>
  );
}
