import React, { useState } from 'react';
import { Card, Button, Modal, Transfer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { User, Role, UserFormValues } from '../../types';
import UserTable from './UserTable';
import UserModal from './UserModal';
import type { TransferProps } from 'antd';

interface UserManagementProps {
  users: User[];
  roles: Role[];
  onCreateUser: (values: UserFormValues) => Promise<void>;
  onUpdateUser: (empId: string, values: UserFormValues) => Promise<void>;
  onDeleteUser: (empId: string) => Promise<void>;
  onAssignRole: (user: User, roleIds: number[]) => Promise<void>;
  loading?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  roles,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onAssignRole,
  loading = false,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetKeys, setTargetKeys] = useState<number[]>([]);

  const handleAdd = (): void => {
    setCurrentUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User): void => {
    setCurrentUser(user);
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: UserFormValues): Promise<void> => {
    if (currentUser) {
      await onUpdateUser(currentUser.empId, values);
    } else {
      await onCreateUser(values);
    }
    setModalVisible(false);
  };

  const handleAssignRole = (user: User): void => {
    setSelectedUser(user);
    setTargetKeys(user.roleIds);
    setRoleModalVisible(true);
  };

  const handleRoleTransferChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys as number[]);
  };

  const handleRoleModalOk = async (): Promise<void> => {
    if (selectedUser) {
      await onAssignRole(selectedUser, targetKeys);
      setRoleModalVisible(false);
      setSelectedUser(null);
    }
  };

  const userActions = {
    onAdd: handleAdd,
    onEdit: handleEdit,
    onDelete: onDeleteUser,
    onAssignRole: handleAssignRole,
  };

  const roleTransferData = roles.map(role => ({
    key: role.id,
    title: role.name,
    description: role.description || '',
  }));

  return (
    <>
      <Card
        title="使用者列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增使用者
          </Button>
        }
      >
        <UserTable users={users} actions={userActions} loading={loading} />
      </Card>

      <UserModal
        visible={modalVisible}
        user={currentUser}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />

      <Modal
        title={`分配角色 - ${selectedUser?.name}`}
        open={roleModalVisible}
        onOk={handleRoleModalOk}
        onCancel={() => {
          setRoleModalVisible(false);
          setSelectedUser(null);
        }}
        width={800}
      >
        <Transfer
          dataSource={roleTransferData}
          titles={['可選角色', '已選角色']}
          targetKeys={targetKeys}
          onChange={handleRoleTransferChange}
          render={(item) => `${item.title} - ${item.description}`}
          listStyle={{
            width: 350,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </Modal>
    </>
  );
};

export default UserManagement;
