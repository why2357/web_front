import React from 'react';

export type ButtonVariant = 'primary' | 'cancel' | 'danger' | 'ghost' | 'link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  cancel: 'btn-cancel',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  link: 'btn-link',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  ...rest
}) => {
  const cls = ['btn', VARIANT_CLASS[variant], loading ? 'loading' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} aria-busy={loading || undefined} {...rest}>
      {loading ? <span aria-hidden className="btn-spinner" /> : null}
      {children}
    </button>
  );
};

export default Button;
