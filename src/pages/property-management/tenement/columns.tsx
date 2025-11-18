import type { TenementDataType } from '@/types/tenement';
import { Badge, Progress, Tag, type TableProps } from 'antd';

/**
 * 大樓管理列表欄位設定
 * @see TenementDataType
 */
const STATUS_MAP = [
  { value: 0, label: '使用中', color: '#87d068' },
  { value: 1, label: '建設中', color: '#f50' },
  { value: 2, label: '已完工', color: '#2db7f5' }
];

const columns: TableProps<TenementDataType>['columns'] = [
  {
    title: 'No.',
    key: 'index',
    render: (_value, _record, index) => index + 1
  },
  {
    title: '大樓名稱',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '負責人',
    dataIndex: 'responsiblePerson',
    key: 'responsiblePerson'
  },
  {
    title: '公司電話',
    dataIndex: 'tel',
    key: 'tel'
  },
  {
    title: '大樓狀態',
    dataIndex: 'status',
    key: 'status',
    render: (value: number) => {
      const status = STATUS_MAP.find(item => item.value === value);

      if (!status) {
        return <Tag color="default">未知狀態</Tag>;
      }

      return (
        <Tag color={status.color}>
          {status.label}
        </Tag>
      );
    }
  },
  {
    title: '空置率',
    dataIndex: 'vacancyRate',
    key: 'vacancyRate',
    render: (value: number) => {
      const isValidNumber = typeof value === 'number' && value >= 0;
      const displayValue = isValidNumber
        ? Number((value * 100).toFixed(4))
        : 0;
      return (<Progress percent={displayValue} status="active" />);
    }
  },
  {
    title: '管理費',
    dataIndex: 'managementFee',
    key: 'managementFee',
    render: (value: string) => (
      <Badge color="green" text={value} />
    )
  },
  {
    title: '操作',
    key: 'action',
  }
];

export default columns;
