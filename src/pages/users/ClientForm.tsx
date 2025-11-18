import { Col, Form, Input, message, Modal, Radio, Row } from 'antd';
import React, { useEffect } from 'react';
import type { CompanyDataType } from './interface';
import { upsertClient } from '@/api/client-list';


/**
 * Represents the structure of company data.
 *
 * @property id？ - The unique identifier for the company (can be the unified business number).
 * @property name - The name of the company.
 * @property status - The current status of the company (e.g., approved, suspended, dissolved).
 * @property phoneNumber - The company's phone number (as a string to accommodate extensions or
 *   special characters).
 * @property industryCategory - The business category or industry of the company (usually a text
 *   description or code).
 * @property email - The company's email address.
 * @property unifiedBusinessNumber - The company's unified business number.
 * @property industryCode - The industry code (refer to Ministry of Finance tax industry
 *   classification).
 * @property responsiblePerson - The responsible person or representative of the company.
 */
type CreateCompanyDataType = Omit<CompanyDataType, 'id'> & {
  id?: string; // 在新增時，ID 可以是可選的
};

interface ClientFormProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  mode: 'CREATE' | 'EDIT';
  onRefresh: () => void;
  client: CreateCompanyDataType | null;
}

const ClientFormModal: React.FC<ClientFormProps> = ({
  visible,
  onClose,
  title,
  mode,
  client,
  onRefresh,
}) => {

  const [form] = Form.useForm<CreateCompanyDataType>();

  useEffect(() => {
    // 確保只在 Modal 顯示時處理表單資料
    if (!visible) {
      return;
    }

    // 如果是編輯模式，則將傳入的 client 資料設置到表單中
    if (mode === 'EDIT' && client) {
      form.setFieldsValue({
        id: client.id,
        name: client.name,
        status: client.status,
        phoneNumber: client.phoneNumber,
        industryCategory: client.industryCategory,
        email: client.email,
        unifiedBusinessNumber: client.unifiedBusinessNumber,
        industryCode: client.industryCode,
        responsiblePerson: client.responsiblePerson
      });
    } else {
      // 如果是新增模式，則清空表單
      form.resetFields();
    }
  }, [client, form, mode, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 在這裡可以處理表單提交的邏輯，例如發送請求到後端
      const { data } = await upsertClient(values);
      message.success(data || '操作成功');
      // 提交後關閉模態框
      onClose();
      // 如果有 onRefresh 函數，則調用它來刷新列表
      onRefresh();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (

    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      width={800}
      onOk={handleOk}
    >
      <Form<CreateCompanyDataType>
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >

        {/* 隱藏的 ID 欄位，僅在編輯模式下使用 */}
        {mode === 'EDIT' && (
          <Form.Item<CreateCompanyDataType>
            name="id"
            hidden={true}
          >
            <Input />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="公司名稱"
              name="name"
              rules={[{ required: true, message: '公司名稱不能為空' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="公司電話"
              name="phoneNumber"
              rules={[
                { required: true, message: '公司電話不能為空' },
                // { pattern: /^0\d{1,2}-\d{6,8}$/, message: "請輸入有效的台灣市話格式，如 02-12345678" }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="公司狀態"
              name="status"
              rules={[{ required: true, message: '公司狀態不能為空' }]}
            >
              <Radio.Group>
                <Radio value="approved">核准設立</Radio>
                <Radio value="suspended">停業</Radio>
                <Radio value="dissolved">解散</Radio>
                <Radio value="revoked">撤銷</Radio>
                <Radio value="annulled">廢止</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="營業項目"
              name="industryCategory"
              rules={[{ required: true, message: '營業項目不能為空' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="電子郵件"
              name="email"
              rules={[
                { required: true, message: '電子郵件不能為空' },
                { type: 'email', message: '請輸入有效的電子郵件' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="統一編號"
              name="unifiedBusinessNumber"
              rules={[
                { required: true, message: '統一編號不能為空' },
                { pattern: /^\d{8}$/, message: '請輸入有效的8位數統一編號' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="行業代碼"
              name="industryCode"
              rules={[{ required: true, message: '行業代碼不能為空' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateCompanyDataType>
              label="負責人"
              name="responsiblePerson"
              rules={[{ required: true, message: '負責人不能為空' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>

  );
};

// 使用 React.memo 來避免不必要的重新 render
// 這樣做的好處是當 props 沒有改變時，組件不會重新 render
export default React.memo(ClientFormModal);
