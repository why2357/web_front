// 根组件 - 配置路由
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import User from './pages/User';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* 默认跳转到登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 登录页 */}
        <Route path="/login" element={<Login />} />

        {/* 用户页 */}
        <Route path="/user" element={<User />} />

        {/* 管理后台页 */}
        <Route path="/admin" element={<Admin />} />

        {/* 404 页面 */}
        <Route path="*" element={<div>404 - 页面不存在</div>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
