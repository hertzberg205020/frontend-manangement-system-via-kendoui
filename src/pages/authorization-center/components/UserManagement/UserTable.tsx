import React from 'react';
import { Table, Button, Space, Badge, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { User, UserActions } from '../../types';
import { TABLE_PAGINATION_CONFIG, MESSAGES } from '../../constants';

interface UserTableProps {
  users: User[];
  actions: UserActions;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, actions, loading = false }) => {
  const columns = [
    {
      title: '員工編號',
      dataIndex: 'empId',
      key: 'empId',
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
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? '啟用' : '停用'}
        />
      ),
    },
    {
      title: '角色數量',
      dataIndex: 'roleIds',
      key: 'roleIds',
      render: (roleIds: number[]) => (
        <Tag color="blue">{roleIds.length} 個角色</Tag>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-TW'),
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
            onConfirm={() => actions.onDelete(record.empId)}
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
      rowKey="empId"
      pagination={TABLE_PAGINATION_CONFIG}
      loading={loading}
    />
  );
};

export default UserTable;
