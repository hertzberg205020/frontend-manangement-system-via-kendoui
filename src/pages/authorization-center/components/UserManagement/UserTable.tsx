import React from 'react';
import { Table, Button, Space, Badge, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { User, UserActions } from '../../types';
import { TABLE_PAGINATION_CONFIG, MESSAGES } from '../../constants';

interface UserTableProps {
  users: User[];
  actions: UserActions;
}

const UserTable: React.FC<UserTableProps> = ({ users, actions }) => {
  const columns = [
    {
      title: '員工編號',
      dataIndex: 'emp_id',
      key: 'emp_id',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: boolean) => (
        <Badge
          status={is_active ? 'success' : 'error'}
          text={is_active ? '啟用' : '停用'}
        />
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(role => (
            <Tag key={role} color="blue">
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => actions.onEdit(record)}
          >
            編輯
          </Button>
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => actions.onAssignRole(record)}
          >
            分配角色
          </Button>
          <Popconfirm
            title={MESSAGES.DELETE_USER_CONFIRM}
            onConfirm={() => actions.onDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      pagination={TABLE_PAGINATION_CONFIG}
    />
  );
};

export default UserTable;
