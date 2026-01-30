import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, width = 420 }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement as HTMLElement | null;
    // focus first focusable element inside modal
    setTimeout(() => {
      const el = panelRef.current?.querySelector('input,button,textarea,select,[tabindex]') as HTMLElement | null;
      el?.focus();
    }, 10);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card modal-card--blue modal-box"
        role="dialog"
        aria-modal="true"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        {title ? <div className="modal-card__title">{title}</div> : null}
        {children}
        {footer ? <div className="modal-card__actions">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
