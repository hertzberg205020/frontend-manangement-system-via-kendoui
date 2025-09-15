import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import type { Role, RoleFormValues } from '../../types';
import { FORM_RULES, MODAL_WIDTH } from '../../constants';

interface RoleModalProps {
  visible: boolean;
  role: Role | null;
  onCancel: () => void;
  onSubmit: (values: RoleFormValues) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  role,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: RoleFormValues): void => {
    onSubmit(values);
    form.resetFields();
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  React.useEffect(() => {
    if (visible && role) {
      form.setFieldsValue(role);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, role, form]);

  return (
    <Modal
      title={role ? '編輯角色' : '新增角色'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={MODAL_WIDTH.SMALL}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="角色名稱" rules={[FORM_RULES.ROLE_NAME]}>
          <Input placeholder="請輸入角色名稱" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
          rules={[FORM_RULES.ROLE_DESCRIPTION]}
        >
          <Input.TextArea placeholder="請輸入角色描述" rows={3} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              {role ? '更新' : '新增'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
