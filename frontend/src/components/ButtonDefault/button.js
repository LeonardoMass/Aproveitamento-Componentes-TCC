import React from 'react';
import styles from './button.module.css';

function Button({
  variant,
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) {
  const composedClassName = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={composedClassName}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
