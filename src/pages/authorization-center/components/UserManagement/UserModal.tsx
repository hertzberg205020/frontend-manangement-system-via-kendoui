import React from 'react';
import { Modal, Form, Input, Switch, Button, Space } from 'antd';
import type { User, UserFormValues } from '../../types';
import { FORM_RULES, MODAL_WIDTH } from '../../constants';

interface UserModalProps {
  visible: boolean;
  user: User | null;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({ visible, user, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  React.useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        empId: user.empId,
        name: user.name,
        isActive: user.isActive,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, user, form]);

  return (
    <Modal
      title={user ? '編輯使用者' : '新增使用者'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={MODAL_WIDTH.SMALL}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="empId" label="員工編號" rules={[FORM_RULES.EMP_ID]}>
          <Input placeholder="請輸入員工編號" disabled={!!user} />
        </Form.Item>

        <Form.Item name="name" label="姓名" rules={[FORM_RULES.NAME]}>
          <Input placeholder="請輸入姓名" />
        </Form.Item>

        {!user && (
          <Form.Item name="password" label="密碼" rules={[FORM_RULES.PASSWORD]}>
            <Input.Password placeholder="請輸入密碼" />
          </Form.Item>
        )}

        <Form.Item name="isActive" label="狀態" valuePropName="checked" initialValue={true}>
          <Switch checkedChildren="啟用" unCheckedChildren="停用" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {user ? '更新' : '新增'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
