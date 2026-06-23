import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  size = 'md',
  text = 'Đang tải...' 
}) => {
  const spinnerSize = size === 'sm' ? '20px' : size === 'lg' ? '60px' : '40px';
  const borderWidth = size === 'sm' ? '2px' : size === 'lg' ? '4px' : '3px';

  const content = (
    <div className="loading-overlay">
      <div 
        className="spinner" 
        style={{ width: spinnerSize, height: spinnerSize, borderWidth }}
      ></div>
      {text && <p className="text-muted text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
