import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    duration: 2000,
    requestId: 0,
  });
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message, duration = 2000) => {
    clearTimeout(timerRef.current);
    setToast(prev => ({
      visible: true,
      message,
      duration,
      requestId: prev.requestId + 1,
    }));
    // 애니메이션 콜백 누락 방지: duration + fade-out(300ms) 후 무조건 숨김
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration + 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        requestId={toast.requestId}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
