import axios from 'axios';
import { getToken, removeToken } from './token';

const request = axios.create({
  baseURL: 'https://xkyx.fun',
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authentication = `${token}`;
    }
    console.log(config)
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
    // 统一处理业务状态码
    // console.log(response);
    
    // if (response.data.code !== 1) {
    //   const errorMsg = response.data?.message || '请求失败';
    //   console.log(response.status)
    //   // 特殊处理登录失效情况
    //   if (response.status === 401 || response.status === 402 || response.data.code === 402) {
    //     console.log(response.data)
    //     handleAuthError();
    //   }
      
    //   return Promise.reject(new Error(errorMsg));
    // }else{
      return response.data;
    
  },
  (error) => {
    console.error("[拦截器错误回调] 完整错误对象:", error);
    console.error("[拦截器错误回调] error.response:", error.response);
    // 增强错误处理
    const status = error.response?.status;
    const responseData = error.response?.data;
    
    // 统一处理授权错误
    if (status === 401 || responseData?.code === 402 || status === 402) {
      console.log(status)
      handleAuthError();
    }else{
        // 其他错误处理...
        console.log(error);
        
        return Promise.reject(new Error(error));
    }
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