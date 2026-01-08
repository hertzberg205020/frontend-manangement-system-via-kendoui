import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Tree, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { Role, RoleFormValues } from '../../types';
import RoleTable from './RoleTable';
import RoleModal from './RoleModal';
import { getPermissionsHierarchy, type PermissionTreeNode } from '@/api/auth-management';
import { notify } from '@/ui';

interface RoleManagementProps {
  roles: Role[];
  onCreateRole: (values: RoleFormValues) => Promise<void>;
  onUpdateRole: (id: number, values: RoleFormValues) => Promise<void>;
  onDeleteRole: (id: number) => Promise<void>;
  onUpdatePermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
  loading?: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onUpdatePermissions,
  loading = false,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionTree, setPermissionTree] = useState<PermissionTreeNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);

  // Load permission hierarchy when permission modal opens
  useEffect(() => {
    if (permissionModalVisible) {
      loadPermissionHierarchy();
    }
  }, [permissionModalVisible]);

  const loadPermissionHierarchy = async (): Promise<void> => {
    try {
      setLoadingPermissions(true);
      const response = await getPermissionsHierarchy();
      setPermissionTree(response.data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      notify.error('載入權限列表失敗');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleAdd = (): void => {
    setCurrentRole(null);
    setModalVisible(true);
  };

  const handleEdit = (role: Role): void => {
    setCurrentRole(role);
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: RoleFormValues): Promise<void> => {
    if (currentRole) {
      await onUpdateRole(currentRole.id, values);
    } else {
      await onCreateRole(values);
    }
    setModalVisible(false);
  };

  const handlePermissionConfig = (role: Role): void => {
    setSelectedRole(role);
    // Convert permissionIds to keys for the tree
    const permissionKeys = role.permissionIds.map((id) => `permission-${id}`);
    setCheckedKeys(permissionKeys);
    setPermissionModalVisible(true);
  };

  // Extract all permission IDs from checked keys
  const extractPermissionIds = (keys: React.Key[]): number[] => {
    const permissionIds: number[] = [];

    const extractFromNode = (node: PermissionTreeNode): void => {
      if (node.isLeaf && node.permissionId) {
        const key = `permission-${node.permissionId}`;
        if (keys.includes(key)) {
          permissionIds.push(node.permissionId);
        }
      }
      if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    permissionTree.forEach(extractFromNode);
    return permissionIds;
  };

  const handlePermissionModalOk = async (): Promise<void> => {
    if (selectedRole) {
      const permissionIds = extractPermissionIds(checkedKeys);
      await onUpdatePermissions(selectedRole.id, permissionIds);
      setPermissionModalVisible(false);
      setSelectedRole(null);
    }
  };

  const roleActions = {
    onAdd: handleAdd,
    onEdit: handleEdit,
    onDelete: onDeleteRole,
    onPermissionConfig: handlePermissionConfig,
  };

  // Convert PermissionTreeNode to Ant Design Tree data format
  const convertToTreeData = (nodes: PermissionTreeNode[]): DataNode[] => {
    return nodes.map((node) => {
      // Always generate consistent key format for leaf nodes with permissionId
      const nodeKey =
        node.isLeaf && node.permissionId ? `permission-${node.permissionId}` : node.key;

      return {
        title: node.title,
        key: nodeKey,
        children: node.children ? convertToTreeData(node.children) : undefined,
        selectable: false,
        checkable: node.isLeaf, // Only leaf nodes should be checkable
      };
    });
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
        <RoleTable roles={roles} actions={roleActions} loading={loading} />
      </Card>

      <RoleModal
        visible={modalVisible}
        role={currentRole}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />

      <Modal
        title={`權限設定 - ${selectedRole?.name}`}
        open={permissionModalVisible}
        onOk={handlePermissionModalOk}
        onCancel={() => {
          setPermissionModalVisible(false);
          setSelectedRole(null);
        }}
        width={800}
        okText="儲存"
        cancelText="取消"
      >
        {loadingPermissions ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Tree
            checkable
            defaultExpandAll
            treeData={convertToTreeData(permissionTree)}
            checkedKeys={checkedKeys}
            onCheck={(checked) => {
              if (Array.isArray(checked)) {
                setCheckedKeys(checked);
              } else {
                setCheckedKeys(checked.checked);
              }
            }}
            style={{
              background: '#fafafa',
              padding: '16px',
              borderRadius: '6px',
              maxHeight: '500px',
              overflow: 'auto',
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default RoleManagement;
