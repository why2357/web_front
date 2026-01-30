// HTTP 请求封装（类似后端的 RestTemplate）
import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://localhost:8000/tts/',
  timeout: 10000,
});

// 开发环境不再自动注入 admin token，需通过 /login 登录获取用户 token

// 请求拦截器：自动添加 Token
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token 与过期时间（带一点宽限期以避免边界问题）
    const token = localStorage.getItem('access_token');
    const exp = localStorage.getItem('access_token_expires_at');
    const graceMs = 5000;
    if (token && exp && Number(exp) - Date.now() > -graceMs) {
      // token 未过期（或刚好过期在宽限期内），附带 Authorization
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // token 不存在或已过期：清理本地存储（但不进行跳转，401 由响应拦截器处理）
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_token_expires_at');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应和错误
service.interceptors.response.use(
  (response) => {
    const responseData = response.data;

    // 如果响应体为空，返回一个空对象以防止下游崩溃
    if (!responseData) {
      return {};
    }

    // 检查响应是否是 { code, message, data } 格式
    if (typeof responseData.code !== 'undefined') {
      // 对于包装过的响应，检查业务状态码
      if (responseData.code === 200 || responseData.code === 201) {
        // 业务成功，返回 data 字段 (如果存在)，否则返回一个空对象防止崩溃
        return responseData.data !== undefined ? responseData.data : {};
      } else {
        // 业务失败，拒绝 Promise
        console.error(`API Error [${responseData.code}]: ${responseData.message}`);
        return Promise.reject(new Error(responseData.message || '请求失败'));
      }
    } else {
      // 对于未包装的响应（如 getHistoryList），直接返回整个响应数据
      return responseData;
    }
  },
  (error) => {
    // 从响应体取错误文案（兼容 message / detail / msg 等）
    const getMessage = (data: any, fallback: string): string => {
      if (!data || typeof data !== 'object') return fallback;
      const msg = data.message ?? data.detail ?? data.msg ?? data.error;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg[0]?.msg ?? msg[0] ?? fallback;
      return fallback;
    };

    if (error.response) {
      const { status, data } = error.response;
      const message = getMessage(data, '请求失败');

      // 401 未授权，跳转到登录页
      if (status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      // 402 积分不足（必须把后端文案抛给前端展示）
      if (status === 402) {
        return Promise.reject(new Error(message || '积分不足'));
      }

      // 403 权限不足（账号被冻结）
      if (status === 403) {
        return Promise.reject(new Error(message || '账号已被冻结'));
      }

      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error('网络连接失败，请检查网络'));
  }
);

export default service;
