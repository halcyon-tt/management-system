import axios from 'axios';
import { getToken, removeToken } from './token';

const request = axios.create({
  baseURL: 'https://xkyx.fun',
  timeout: 1000000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authentication = `${token}`;
    }
    // console.log(config)
    // 优化内容类型处理逻辑
    if (config.method?.toUpperCase() === 'POST' && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.log(error)
    if (error.response && error.response.status === 401) {
      handleAuthError();
      return Promise.reject(error);
    } else if (error.response && error.response.status === 402) {
      alert('您的账号已在其他地方登录，请重新登录')
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// 封装授权错误处理
let isHandlingAuthError = false;
function handleAuthError() {
  if (isHandlingAuthError) return;

  isHandlingAuthError = true;

  try {
    // 清除本地认证信息
    removeToken();

    // 防止在非浏览器环境执行
    if (typeof window !== 'undefined') {
      alert('登录信息已过期，请重新登录');
      // 添加延时避免异步请求冲突
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    }
  } finally {
    isHandlingAuthError = false;
  }
}

export default request;