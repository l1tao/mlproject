import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { useAuthStore } from './stores/authStore';

// 页面组件
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import ModelConfig from './pages/ModelConfig';
import NotFound from './pages/NotFound';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  if (isAuthenticated === null) {
    // 正在检查认证状态
    return <div className="loading-container">正在加载...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/chat" />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:chatId" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="model-config" element={<ModelConfig />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;