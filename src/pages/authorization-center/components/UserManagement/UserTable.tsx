import React from 'react';
import { Table, Button, Space, Badge, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined, UndoOutlined } from '@ant-design/icons';
import type { User, UserActions, Role } from '../../types';
import { TABLE_PAGINATION_CONFIG, MESSAGES } from '../../constants';

interface UserTableProps {
  users: User[];
  roles: Role[];
  actions: UserActions;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, roles, actions, loading = false }) => {
  // 建立角色 ID 到名稱的對應表
  const roleMap = React.useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role.name;
      return acc;
    }, {} as Record<number, string>);
  }, [roles]);
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
      title: '角色名稱',
      dataIndex: 'roleIds',
      key: 'roleIds',
      width: 280,
      render: (roleIds: number[]) => (
        <>
          {roleIds.length > 0 ? (
            roleIds.map(roleId => (
              <Tag color="blue" key={roleId}>
                {roleMap[roleId] || `未知角色(${roleId})`}
              </Tag>
            ))
          ) : (
            <Tag color="default">未分配角色</Tag>
          )}
        </>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
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
          {record.isActive ? (
            <Popconfirm
              title={MESSAGES.DELETE_USER_CONFIRM}
              onConfirm={() => actions.onDelete(record.empId)}
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                停權
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title={MESSAGES.RESTORE_USER_CONFIRM}
              onConfirm={() => actions.onRestore(record.empId)}
            >
              <Button type="text" icon={<UndoOutlined />}>
                恢復
              </Button>
            </Popconfirm>
          )}
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
