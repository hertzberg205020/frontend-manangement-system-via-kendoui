import React from 'react';
import { Card, Tabs, Typography } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useAuthorizationData } from './hooks/useAuthorizationData';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import type { TabsProps } from 'antd';

const { Title } = Typography;

const AuthorizationCenter: React.FC = () => {
  const {
    // 資料
    users,
    roles,
    loading,
    // 使用者操作
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    // 角色操作
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
  } = useAuthorizationData();

  const tabItems: TabsProps['items'] = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          使用者管理
        </span>
      ),
      children: (
        <UserManagement
          users={users}
          roles={roles}
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onAssignRole={assignRole}
          loading={loading}
        />
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <TeamOutlined />
          角色管理
        </span>
      ),
      children: (
        <RoleManagement
          roles={roles}
          onCreateRole={createRole}
          onUpdateRole={updateRole}
          onDeleteRole={deleteRole}
          onUpdatePermissions={updatePermissions}
          loading={loading}
        />
      ),
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <SafetyOutlined style={{ marginRight: '8px' }} />
          權限管理系統
        </Title>

        <Tabs defaultActiveKey="users" size="large" items={tabItems} />
      </Card>
    </div>
  );
};

export default AuthorizationCenter;
