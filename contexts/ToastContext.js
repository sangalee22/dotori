import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    duration: 2000,
  });

  const showToast = useCallback((message, duration = 2000) => {
    setToast({
      visible: true,
      message,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        duration={toast.duration}
        onHide={hideToast}
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
