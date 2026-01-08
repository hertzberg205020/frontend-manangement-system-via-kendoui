import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import NavSidebar from '@/components/navSidebar';
import CustomBreadcrumb from '@/components/breadCrumb';
import LayoutHeader from '@/components/layoutHeader';
import { Outlet } from 'react-router';
import TabsManager from '@/components/tabsManager';
import { useRouteSync } from '@/hooks/useRouteSync';

const { Header, Content, Footer, Sider } = Layout;

const Home: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useRouteSync();

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        // style={{ maxHeight: '100vh', overflow: 'auto' }}
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <NavSidebar collapsed={collapsed} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 20px 0 0',
            background: colorBgContainer,
            textAlign: 'right',
          }}
        >
          <LayoutHeader />
        </Header>
        <Content
          style={{
            margin: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <CustomBreadcrumb />

          <div
            className="tabs-container"
            style={{
              flexShrink: 0,
              background: colorBgContainer,
              borderRadius: `${borderRadiusLG}px ${borderRadiusLG}px 0 0`,
              marginBottom: 0,
            }}
          >
            <TabsManager />
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              padding: 24,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Home;
