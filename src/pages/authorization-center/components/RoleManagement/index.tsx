import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Role, RoleFormValues } from '../../types';
import RoleTable from './RoleTable';
import RoleModal from './RoleModal';

interface RoleManagementProps {
  roles: Role[];
  onCreateRole: (values: RoleFormValues) => void;
  onUpdateRole: (id: number, values: RoleFormValues) => void;
  onDeleteRole: (id: number) => void;
  onPermissionConfig: (role: Role) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onPermissionConfig,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const handleAdd = (): void => {
    setCurrentRole(null);
    setModalVisible(true);
  };

  const handleEdit = (role: Role): void => {
    setCurrentRole(role);
    setModalVisible(true);
  };

  const handleModalSubmit = (values: RoleFormValues): void => {
    if (currentRole) {
      onUpdateRole(currentRole.id, values);
    } else {
      onCreateRole(values);
    }
    setModalVisible(false);
  };

  const roleActions = {
    onAdd: handleAdd,
    onEdit: handleEdit,
    onDelete: onDeleteRole,
    onPermissionConfig,
  };

  return (
    <>
      <Card
        title="角色列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        }
      >
        <RoleTable roles={roles} actions={roleActions} />
      </Card>

      <RoleModal
        visible={modalVisible}
        role={currentRole}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default RoleManagement;
