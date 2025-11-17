import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import type { Role } from '../../types';
import { MODAL_WIDTH } from '../../constants';

const { Text } = Typography;

interface PermissionModalProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * @deprecated This component is deprecated. Use the integrated permission management
 * in RoleManagement component instead.
 */
const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  role,
  onCancel,
  onSave,
}) => {
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
        <Text type="secondary">此組件已棄用，請使用 RoleManagement 中的整合權限管理功能</Text>
      </div>
    </Modal>
  );
};

export default PermissionModal;
