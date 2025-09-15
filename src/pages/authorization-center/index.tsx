import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Space,
  message,
  Tree,
  Popconfirm,
  Badge,
  Row,
  Col,
  Typography
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// 型別定義
interface User {
  id: number;
  name: string;
  emp_id: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  user_count: number;
  permission_count: number;
  created_at: string;
}

interface Resource {
  id: number;
  code: string;
  description: string;
  is_active: boolean;
}

interface Permission {
  id: number;
  resource_id: number;
  action: string;
  description: string;
}

interface UserFormValues {
  emp_id: string;
  name: string;
  password?: string;
  is_active: boolean;
}

interface RoleFormValues {
  name: string;
  description: string;
}

const AuthorizationCenter: React.FC = () => {
  // 模擬資料狀態
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: '張三',
      emp_id: 'EMP001',
      is_active: true,
      roles: ['管理員', '使用者'],
      created_at: '2024-01-15'
    },
    {
      id: 2,
      name: '李四',
      emp_id: 'EMP002',
      is_active: true,
      roles: ['使用者'],
      created_at: '2024-01-16'
    },
    {
      id: 3,
      name: '王五',
      emp_id: 'EMP003',
      is_active: false,
      roles: ['訪客'],
      created_at: '2024-01-17'
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: '管理員',
      description: '系統管理員，擁有所有權限',
      user_count: 1,
      permission_count: 12,
      created_at: '2024-01-10'
    },
    {
      id: 2,
      name: '使用者',
      description: '一般使用者，基本操作權限',
      user_count: 2,
      permission_count: 6,
      created_at: '2024-01-10'
    },
    {
      id: 3,
      name: '訪客',
      description: '訪客角色，僅檢視權限',
      user_count: 1,
      permission_count: 2,
      created_at: '2024-01-10'
    }
  ]);

  const [resources] = useState<Resource[]>([
    { id: 1, code: 'user.profile', description: '使用者資料', is_active: true },
    { id: 2, code: 'dashboard', description: '儀表板', is_active: true },
    { id: 3, code: 'reports', description: '報表管理', is_active: true },
    { id: 4, code: 'settings', description: '系統設定', is_active: true }
  ]);

  const [permissions] = useState<Permission[]>([
    { id: 1, resource_id: 1, action: 'read', description: '檢視使用者資料' },
    { id: 2, resource_id: 1, action: 'edit', description: '編輯使用者資料' },
    { id: 3, resource_id: 2, action: 'read', description: '檢視儀表板' },
    { id: 4, resource_id: 3, action: 'read', description: '檢視報表' },
    { id: 5, resource_id: 3, action: 'create', description: '建立報表' },
    { id: 6, resource_id: 3, action: 'edit', description: '編輯報表' },
    { id: 7, resource_id: 3, action: 'delete', description: '刪除報表' },
    { id: 8, resource_id: 4, action: 'read', description: '檢視系統設定' },
    { id: 9, resource_id: 4, action: 'edit', description: '編輯系統設定' }
  ]);

  // Modal 狀態
  const [userModalVisible, setUserModalVisible] = useState<boolean>(false);
  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Form 實例
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // 使用者表格欄位
  const userColumns = [
    {
      title: '員工編號',
      dataIndex: 'emp_id',
      key: 'emp_id',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120
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
      )
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(role => (
            <Tag key={role} color="blue">{role}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            編輯
          </Button>
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => handleAssignRole(record)}
          >
            分配角色
          </Button>
          <Popconfirm
            title="確定要刪除此使用者嗎？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 角色表格欄位
  const roleColumns = [
    {
      title: '角色名稱',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '使用者數量',
      dataIndex: 'user_count',
      key: 'user_count',
      width: 120,
      render: (count: number) => <Badge count={count} color="blue" />
    },
    {
      title: '權限數量',
      dataIndex: 'permission_count',
      key: 'permission_count',
      width: 120,
      render: (count: number) => <Badge count={count} color="green" />
    },
    {
      title: '建立時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            編輯
          </Button>
          <Button
            type="text"
            icon={<SafetyOutlined />}
            onClick={() => handleRolePermission(record)}
          >
            權限設定
          </Button>
          <Popconfirm
            title="確定要刪除此角色嗎？"
            onConfirm={() => handleDeleteRole(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 事件處理函式
  const handleAddUser = (): void => {
    setCurrentUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User): void => {
    setCurrentUser(user);
    userForm.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId: number): void => {
    setUsers(users.filter(user => user.id !== userId));
    message.success('使用者已刪除');
  };

  const handleAssignRole = (user: User): void => {
    setCurrentUser(user);
    message.info('角色分配功能開發中');
  };

  const handleAddRole = (): void => {
    setCurrentRole(null);
    roleForm.resetFields();
    setRoleModalVisible(true);
  };

  const handleEditRole = (role: Role): void => {
    setCurrentRole(role);
    roleForm.setFieldsValue(role);
    setRoleModalVisible(true);
  };

  const handleDeleteRole = (roleId: number): void => {
    setRoles(roles.filter(role => role.id !== roleId));
    message.success('角色已刪除');
  };

  const handleRolePermission = (role: Role): void => {
    setCurrentRole(role);
    setPermissionModalVisible(true);
  };

  const onUserSubmit = (values: UserFormValues): void => {
    if (currentUser) {
      setUsers(users.map(user =>
        user.id === currentUser.id ? { ...user, ...values } : user
      ));
      message.success('使用者資訊已更新');
    } else {
      const newUser: User = {
        id: Date.now(),
        ...values,
        roles: [],
        created_at: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      message.success('使用者已新增');
    }
    setUserModalVisible(false);
  };

  const onRoleSubmit = (values: RoleFormValues): void => {
    if (currentRole) {
      setRoles(roles.map(role =>
        role.id === currentRole.id ? { ...role, ...values } : role
      ));
      message.success('角色資訊已更新');
    } else {
      const newRole: Role = {
        id: Date.now(),
        ...values,
        user_count: 0,
        permission_count: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
      message.success('角色已新增');
    }
    setRoleModalVisible(false);
  };

  const getPermissionTreeData = () => {
    return resources.map(resource => ({
      title: resource.description,
      key: `resource-${resource.id}`,
      children: permissions
        .filter(p => p.resource_id === resource.id)
        .map(permission => ({
          title: `${getActionText(permission.action)} - ${permission.description}`,
          key: `permission-${permission.id}`
        }))
    }));
  };

  const getActionText = (action: string): string => {
    const actionMap: Record<string, string> = {
      'read': '檢視',
      'create': '建立',
      'edit': '編輯',
      'delete': '刪除'
    };
    return actionMap[action] || action;
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <SafetyOutlined style={{ marginRight: '8px' }} />
          權限管理系統
        </Title>

        <Tabs defaultActiveKey="users" size="large">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                使用者管理
              </span>
            }
            key="users"
          >
            <Card
              title="使用者列表"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddUser}
                >
                  新增使用者
                </Button>
              }
            >
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                角色管理
              </span>
            }
            key="roles"
          >
            <Card
              title="角色列表"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRole}
                >
                  新增角色
                </Button>
              }
            >
              <Table
                columns={roleColumns}
                dataSource={roles}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
                }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                權限總覽
              </span>
            }
            key="permissions"
          >
            <Row gutter={[16, 16]}>
              {resources.map(resource => (
                <Col xs={24} sm={12} lg={6} key={resource.id}>
                  <Card
                    title={resource.description}
                    size="small"
                    extra={<Tag color="green">啟用</Tag>}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {permissions
                        .filter(p => p.resource_id === resource.id)
                        .map(permission => (
                          <div key={permission.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Text type="secondary">{getActionText(permission.action)}</Text>
                            <Tag>{permission.description}</Tag>
                          </div>
                        ))}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>

        {/* 使用者新增/編輯對話框 */}
        <Modal
          title={currentUser ? '編輯使用者' : '新增使用者'}
          open={userModalVisible}
          onCancel={() => setUserModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={userForm}
            layout="vertical"
            onFinish={onUserSubmit}
          >
            <Form.Item
              name="emp_id"
              label="員工編號"
              rules={[{ required: true, message: '請輸入員工編號' }]}
            >
              <Input placeholder="請輸入員工編號" />
            </Form.Item>

            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input placeholder="請輸入姓名" />
            </Form.Item>

            {!currentUser && (
              <Form.Item
                name="password"
                label="密碼"
                rules={[{ required: true, message: '請輸入密碼' }]}
              >
                <Input.Password placeholder="請輸入密碼" />
              </Form.Item>
            )}

            <Form.Item
              name="is_active"
              label="狀態"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="啟用" unCheckedChildren="停用" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setUserModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {currentUser ? '更新' : '新增'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 角色新增/編輯對話框 */}
        <Modal
          title={currentRole ? '編輯角色' : '新增角色'}
          open={roleModalVisible}
          onCancel={() => setRoleModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={roleForm}
            layout="vertical"
            onFinish={onRoleSubmit}
          >
            <Form.Item
              name="name"
              label="角色名稱"
              rules={[{ required: true, message: '請輸入角色名稱' }]}
            >
              <Input placeholder="請輸入角色名稱" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '請輸入角色描述' }]}
            >
              <Input.TextArea
                placeholder="請輸入角色描述"
                rows={3}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setRoleModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {currentRole ? '更新' : '新增'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 角色權限設定對話框 */}
        <Modal
          title={`設定角色權限 - ${currentRole?.name}`}
          open={permissionModalVisible}
          onCancel={() => setPermissionModalVisible(false)}
          width={600}
          footer={
            <Space>
              <Button onClick={() => setPermissionModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" onClick={() => {
                message.success('權限設定已更新');
                setPermissionModalVisible(false);
              }}>
                儲存
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              請選擇要分配給此角色的權限
            </Text>
          </div>
          <Tree
            checkable
            defaultExpandAll
            treeData={getPermissionTreeData()}
            style={{ background: '#fafafa', padding: '16px', borderRadius: '6px' }}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default AuthorizationCenter;
