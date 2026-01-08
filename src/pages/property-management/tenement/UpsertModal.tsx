import { upsertTenement } from '@/api/tenement';
import { useAppSelector } from '@/store';
import type { CreateTenementDataType } from '@/types/tenement';
import { Col, Form, Input, InputNumber, Modal, Radio, Row } from 'antd';
import React from 'react';
import { useEffect } from 'react';
import { notify } from '@/ui';

interface FormProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  mode: 'CREATE' | 'EDIT';
  onRefresh: () => void;
}

const TenementFormModal: React.FC<FormProps> = ({ visible, onClose, title, mode, onRefresh }) => {
  const [form] = Form.useForm<CreateTenementDataType>();
  const { tenementDatum: datum } = useAppSelector((state) => state.tenementSlice);

  useEffect(() => {
    // 確保只在 Modal 顯示時處理表單資料
    if (!visible) {
      return;
    }

    // 如果是編輯模式，則將傳入的 datum 資料設置到表單中
    if (mode === 'EDIT' && datum) {
      form.setFieldsValue({
        id: datum.id,
        name: datum.name,
        responsiblePerson: datum.responsiblePerson,
        tel: datum.tel,
        status: datum.status,
        vacancyRate: datum.vacancyRate,
        managementFee: datum.managementFee,
      });
    } else {
      // 如果是新增模式，則清空表單
      form.resetFields();
    }
  }, [datum, form, mode, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 在這裡可以處理表單提交的邏輯，例如發送請求到後端
      console.log('Form values:', values);
      const { data } = await upsertTenement(values);
      notify.success(data || '操作成功');

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
    <Modal title={title} open={visible} onCancel={handleCancel} width={800} onOk={handleOk}>
      <Form<CreateTenementDataType> form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        {/* 隱藏的 ID 欄位，僅在編輯模式下使用 */}
        {mode === 'EDIT' && (
          <Form.Item<CreateTenementDataType> name="id" hidden={true}>
            <Input />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="物業名稱"
              name="name"
              rules={[{ required: true, message: '物業名稱不能為空' }]}
            >
              <Input placeholder="請輸入物業名稱" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="負責人"
              name="responsiblePerson"
              rules={[{ required: true, message: '負責人不能為空' }]}
            >
              <Input placeholder="請輸入負責人姓名" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="聯絡電話"
              name="tel"
              rules={[
                { required: true, message: '聯絡電話不能為空' },
                // { pattern: /^0\d{1,2}-?\d{6,8}$/, message: "請輸入有效的台灣電話格式" }
              ]}
            >
              <Input placeholder="例: 02-12345678" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="大樓狀態"
              name="status"
              rules={[{ required: true, message: '大樓狀態不能為空' }]}
            >
              <Radio.Group>
                <Radio value={0}>使用中</Radio>
                <Radio value={1}>建設中</Radio>
                <Radio value={2}>已完工</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="空置率 (%)"
              name="vacancyRate"
              rules={[{ type: 'number', min: 0, max: 100, message: '空置率必須在 0-100 之間' }]}
            >
              <InputNumber
                min={0}
                max={100}
                precision={2}
                style={{ width: '100%' }}
                placeholder="請輸入空置率"
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<CreateTenementDataType>
              label="管理費"
              name="managementFee"
              rules={[{ required: true, message: '管理費不能為空' }]}
            >
              <Input placeholder="請輸入管理費金額" addonBefore="$" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// 使用 React.memo 來避免不必要的重新 render
export default React.memo(TenementFormModal);
