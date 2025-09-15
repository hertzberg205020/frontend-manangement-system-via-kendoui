import React from 'react';
import { Modal, Button, Space, Tree, Typography } from 'antd';
import type { Role, Resource, Permission } from '../../types';
import { generatePermissionTreeData } from '../../utils';
import { MODAL_WIDTH } from '../../constants';

const { Text } = Typography;

interface PermissionModalProps {
  visible: boolean;
  role: Role | null;
  resources: Resource[];
  permissions: Permission[];
  onCancel: () => void;
  onSave: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  role,
  resources,
  permissions,
  onCancel,
  onSave,
}) => {
  const treeData = generatePermissionTreeData(resources, permissions);

  return (
    <Modal
      title={`設定角色權限 - ${role?.name}`}
      open={visible}
      onCancel={onCancel}
      width={MODAL_WIDTH.MEDIUM}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onSave}>
            儲存
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <Text type="secondary">請選擇要分配給此角色的權限</Text>
      </div>
      <Tree
        checkable
        defaultExpandAll
        treeData={treeData}
        style={{
          background: '#fafafa',
          padding: '16px',
          borderRadius: '6px',
        }}
      />
    </Modal>
  );
};

export default PermissionModal;
