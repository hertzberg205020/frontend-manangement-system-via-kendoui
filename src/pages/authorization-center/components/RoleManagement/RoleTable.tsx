import React from 'react';
import { Table, Button, Space, Badge, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import type { Role, RoleActions } from '../../types';
import { TABLE_PAGINATION_CONFIG, MESSAGES } from '../../constants';

interface RoleTableProps {
  roles: Role[];
  actions: RoleActions;
  loading?: boolean;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, actions, loading = false }) => {
  const columns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '權限數量',
      dataIndex: 'permissionIds',
      key: 'permissionIds',
      width: 120,
      render: (permissionIds: number[]) => (
        <Badge
          count={permissionIds.length}
          showZero
          color="green"
        />
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (text: string) => new Date(text).toLocaleString('zh-TW'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: unknown, record: Role) => (
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
            icon={<SafetyOutlined />}
            onClick={() => actions.onPermissionConfig(record)}
          >
            權限設定
          </Button>
          <Popconfirm
            title={MESSAGES.DELETE_ROLE_CONFIRM}
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
      dataSource={roles}
      rowKey="id"
      pagination={TABLE_PAGINATION_CONFIG}
      loading={loading}
    />
  );
};

export default RoleTable;
