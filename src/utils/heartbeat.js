import request from './request';

let heartbeatTimer = null;

export const startHeartbeat = () => {
  // 立即执行首次检测
  checkToken();
  
  // 每2分钟检测一次（可根据需求调整）
  heartbeatTimer = setInterval(checkToken, 2 * 60 * 1000);
};

export const stopHeartbeat = () => {
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
};

const checkToken = () => {
  request.get('/admin/checkToken')
    .catch(error => {
      if (error.response?.status === 401) {
        window.location.reload(); // 触发全局错误处理
      }
    });
};