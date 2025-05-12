import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../store/modules/user';
import { loginAPI } from '../../apis/LoginApi';
import { setToken } from '../../utils';
import './Login.scss';
import logo from '../../assets/DCEE00A7D90A0BF3ABB916C53A9E4401.png';
import { createStyles } from 'antd-style';
import { useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import { removeToken } from '../../utils';
import { logout } from '../../store/modules/user';
import store from '../../store';
const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      width: 100%;
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, rgba(18, 105, 236, 0.99), rgba(9, 223, 238, 0.83));
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }
      &:focus::before,
      &:hover::before {
        opacity: 0;
      }
      &:hover,
      &:focus {
        background-color: #fff;
        color: #000;
        border-color: #fff;
      }
    }
  `,
}));

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { styles } = useStyle();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams] = useSearchParams();
 
  useEffect(() => {
    const reason = searchParams.get('reason');
    const redirect = searchParams.get('redirect');
  
    // 强化错误类型处理
    const errorMessages = {
      expired: {
        type: 'warning',
        content: '登录已过期，请重新登录',
        delay: 0
      },
      conflict: {
        type: 'error',
        content: '您的账号已在其他设备登录，如非本人操作请及时修改密码！',
        delay: 3000  // 冲突提示显示更久
      }
    };
  
    if (reason && errorMessages[reason]) {
      messageApi[errorMessages[reason].type]({
        content: errorMessages[reason].content,
        duration: errorMessages[reason].delay
      });
  
      // 冲突登录后强制清空历史状态
      if (reason === 'conflict') {
        removeToken();
        store.dispatch(logout());
      }
    }
  
    if (!reason && redirect) {
      messageApi.info('请登录后继续操作');
    }
  }, [messageApi, navigate, searchParams]);



  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);
    
    try {
      const response = await loginAPI({ username, password });
      console.log('接口返回数据:', response);
      if (response.code === 1) {
        const { token, adminId, username, wechatId, phoneNumber, qrCodeUrl } = response.data;
        setToken(response.data.token) 
        dispatch(
          login({
            token,
            adminId,
            username,
            wechatId,
            phoneNumber,
            qrCodeUrl,
          }),
        );
        
        // 显示成功消息（保持按钮样式）
        messageApi.success({
          content: '登录成功！欢迎回来',
          duration: 1.5,
        });

        // 延迟跳转保证消息可见
        setTimeout(() => {
          navigate('/home');
        }, 1800);
      } else {
        messageApi.error({
          content: response.msg || '登录失败，请稍后重试',
        });
      }
    } catch (error) {
      messageApi.error({
        content: error.message || '网络连接异常',
        duration: 2.5,
      
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {contextHolder}
      <div className="container">
        <div className="login-container">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
          <div className="login-wrapper">
            <div className="header">欢迎回来</div>
            <div className="form-wrapper">
              <Form onFinish={onFinish}>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  className={styles.linearGradientButton}
                >
                  登录
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;