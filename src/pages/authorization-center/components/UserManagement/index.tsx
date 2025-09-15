import React, { useState } from 'react';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { User, UserFormValues } from '../../types';
import UserTable from './UserTable';
import UserModal from './UserModal';

interface UserManagementProps {
  users: User[];
  onCreateUser: (values: UserFormValues) => void;
  onUpdateUser: (id: number, values: UserFormValues) => void;
  onDeleteUser: (id: number) => void;
  onAssignRole: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onAssignRole,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleAdd = (): void => {
    setCurrentUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User): void => {
    setCurrentUser(user);
    setModalVisible(true);
  };

  const handleModalSubmit = (values: UserFormValues): void => {
    if (currentUser) {
      onUpdateUser(currentUser.id, values);
    } else {
      onCreateUser(values);
    }
    setModalVisible(false);
  };

  const userActions = {
    onAdd: handleAdd,
    onEdit: handleEdit,
    onDelete: onDeleteUser,
    onAssignRole,
  };

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
        <UserTable users={users} actions={userActions} />
      </Card>

      <UserModal
        visible={modalVisible}
        user={currentUser}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default UserManagement;
