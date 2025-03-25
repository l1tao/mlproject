import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageOutlined,
  SettingOutlined,
  ApiOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const createNewChat = () => {
    navigate('/chat');
  };

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const menuItems = [
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '对话',
      onClick: () => navigate('/chat')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      key: 'model-config',
      icon: <ApiOutlined />,
      label: '模型配置',
      onClick: () => navigate('/model-config')
    }
  ];

  // 根据当前路径确定选中的菜单项
  const selectedKey = location.pathname.split('/')[1] || 'chat';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {!collapsed ? '内网AI对话平台' : 'AI'}
          </Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={createNewChat}
          style={{ 
            margin: '0 16px 16px', 
            width: collapsed ? 'calc(100% - 32px)' : 'calc(100% - 32px)' 
          }}
        >
          {!collapsed && '新对话'}
        </Button>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#141414', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'white', fontSize: '16px' }}
          />
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} />
              {user && <span style={{ marginLeft: 8, color: 'white' }}>{user.username}</span>}
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: '#141414',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;