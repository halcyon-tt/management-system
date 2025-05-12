import React, { useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/modules/user';
import { removeToken } from '../../utils';
import './Layout.scss';
import logo from '../../assets/62BE5D7EF552E8ABFD297C8D41A7EACA.png'

const { Header, Sider, Content } = Layout;

const LayoutComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  // 添加强制刷新逻辑
  useEffect(() => {
    if (navigationType === 'PUSH') {
      window.location.reload();
    }
  }, [location.pathname, navigationType]);

  const getSelectedKeys = () => {
    const path = location.pathname;
    const menuItems = [
      '/home',
      '/order',
      '/activitymanager',
      '/activitycontroller',
      '/usermanager',
      '/merchant1',
      '/userOrder'
    ];
    return menuItems.filter(item => path.startsWith(item));
  };

  const handleLogout = () => {
    removeToken();
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuClick = ({ key }) => {
    // 修改跳转逻辑，添加state触发刷新
    navigate(key, {
      state: { timestamp: Date.now() }
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div className="logo"><img src={logo} alt='Logo'/>管理系统</div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          items={[
            { key: '/home', label: '首页' },
            { key: '/order', label: '订单管理' },
            { key: '/activitymanager', label: '活动添加' },
            { key: '/activitycontroller',label:'活动管理'},
            { key: '/usermanager', label: '用户反馈' },
            { key: '/merchant1',label:'商家管理'},
            {key:'/userOrder',label:'用户订单'}
          ]}
        />
      </Sider>

      <Layout>
        <Header>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Header>

        <Content style={{ margin: '16px' }}>
          {/* 添加key强制重新挂载组件 */}
          <Outlet key={location.pathname} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;