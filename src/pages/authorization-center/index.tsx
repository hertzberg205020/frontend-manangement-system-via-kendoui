import React, { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthorizationData } from './hooks/useAuthorizationData';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import PermissionOverview from './components/PermissionOverview';
import PermissionModal from './components/PermissionModal';
import type { Role } from './types';
import type { TabsProps } from 'antd';

const { Title } = Typography;

const AuthorizationCenter: React.FC = () => {
  const {
    // 資料
    users,
    roles,
    resources,
    permissions,
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

  // 權限設定 Modal 狀態
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const handlePermissionConfig = (role: Role): void => {
    setCurrentRole(role);
    setPermissionModalVisible(true);
  };

  const handlePermissionSave = (): void => {
    updatePermissions();
    setPermissionModalVisible(false);
  };

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
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onAssignRole={assignRole}
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
          onPermissionConfig={handlePermissionConfig}
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

        <PermissionModal
          visible={permissionModalVisible}
          role={currentRole}
          resources={resources}
          permissions={permissions}
          onCancel={() => setPermissionModalVisible(false)}
          onSave={handlePermissionSave}
        />
      </Card>
    </div>
  );
};

export default AuthorizationCenter;
