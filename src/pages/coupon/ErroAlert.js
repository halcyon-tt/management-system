// src/components/ErrorAlert.jsx
import { Alert } from 'antd';

const ErrorAlert = ({ error }) => (
  <Alert
    message="请求异常"
    description={`错误代码：${error.code || 500}（${error.message || '未知错误'}）`}
    type="error"
    showIcon
    closable
    className="error-alert"
  />
);
export default ErrorAlert