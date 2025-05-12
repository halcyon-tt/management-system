export const generateDeviceId = () => {
  // 尝试从 localStorage 读取已有设备ID
  const storedId = localStorage.getItem('deviceId');
  if (storedId) return storedId;

  // 生成新ID（组合时间戳 + 随机数 + 用户代理信息）
  const newId = [
    Date.now().toString(36),
    Math.random().toString(36).substr(2, 5),
    navigator.userAgent.substr(0, 50) // 取部分用户代理信息
  ].join('-');

  // 存储到 localStorage
  localStorage.setItem('deviceId', newId);
  return newId;
};