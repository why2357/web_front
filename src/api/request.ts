// HTTP 请求封装（类似后端的 RestTemplate）
import axios from "axios";

// 开发环境默认连本地后端，生产环境默认相对路径（同域 Nginx 反代）；可用 .env 里 VITE_API_BASE 覆盖
const baseURL =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  (import.meta.env.DEV ? "http://172.28.104.54:8000/" : "/tts/");
// (import.meta.env.DEV ? "http://172.28.104.54:8000/tts/" : "/tts/");

const service = axios.create({
  baseURL,
  timeout: 10000,
});

// 请求拦截器：优先使用 localStorage 中的登录 token
// 开发环境下，如果没有有效的 localStorage token，可以使用 VITE_DEV_TOKEN 作为备用
service.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    const isDev = import.meta.env.DEV;

    // 优先从 localStorage 获取登录后的 token
    const stored = localStorage.getItem("access_token");
    const exp = localStorage.getItem("access_token_expires_at");
    const graceMs = 5000;

    // 调试日志
    console.log("[Request] URL:", config.url);
    console.log(config);
    console.log(
      "[Request] stored:",
      stored ? `${stored.substring(0, 20)}...` : "null",
    );
    console.log("[Request] exp:", exp);
    console.log(
      "[Request] 时间检查:",
      exp ? Number(exp) - Date.now() : "无过期时间",
    );

    if (stored && exp && Number(exp) - Date.now() > -graceMs) {
      // localStorage 中有有效的 token
      token = stored;
      console.log("[Request] 使用 localStorage token");
    } else if (isDev && import.meta.env.VITE_DEV_TOKEN) {
      // 开发环境下，如果没有有效的 localStorage token，使用 VITE_DEV_TOKEN 作为备用
      token = import.meta.env.VITE_DEV_TOKEN;
      console.log("[Request] 使用 VITE_DEV_TOKEN");
    } else {
      console.log("[Request] 没有可用的 token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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
    if (typeof responseData.code !== "undefined") {
      // 对于包装过的响应，检查业务状态码
      if (responseData.code === 200 || responseData.code === 201) {
        // 业务成功，返回 data 字段 (如果存在)，否则返回一个空对象防止崩溃
        return responseData.data !== undefined ? responseData.data : {};
      } else {
        // 业务失败，拒绝 Promise
        console.error(
          `API Error [${responseData.code}]: ${responseData.message}`,
        );
        return Promise.reject(new Error(responseData.message || "请求失败"));
      }
    } else {
      // 对于未包装的响应（如 getHistoryList），直接返回整个响应数据
      return responseData;
    }
  },
  (error) => {
    // 从响应体取错误文案（兼容 message / detail / msg 等）
    const getMessage = (data: any, fallback: string): string => {
      if (!data || typeof data !== "object") return fallback;
      const msg = data.message ?? data.detail ?? data.msg ?? data.error;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg[0]?.msg ?? msg[0] ?? fallback;
      return fallback;
    };

    if (error.response) {
      const { status, data } = error.response;
      const message = getMessage(data, "请求失败");

      // 401 未授权，跳转到登录页
      if (status === 401) {
        console.log("[Response] 401 错误:", data);
        // localStorage.removeItem("access_token");
        // localStorage.removeItem("access_token_expires_at");
        window.location.href = "/login";
        return Promise.reject(new Error("登录已过期，请重新登录"));
      }

      // 402 积分不足（必须把后端文案抛给前端展示）
      if (status === 402) {
        console.log("积分不足");
        return Promise.reject(new Error(message || "积分不足"));
      }

      // 403 权限不足（账号被冻结）
      if (status === 403) {
        return Promise.reject(new Error(message || "账号已被冻结"));
      }

      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error("网络连接失败，请检查网络"));
  },
);

export default service;
