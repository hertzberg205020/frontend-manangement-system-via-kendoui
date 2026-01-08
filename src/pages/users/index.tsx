import {
  Button,
  Card,
  Col,
  Input,
  message,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tag,
  type PaginationProps,
  type TableProps,
} from 'antd';
import type { CompanyDataType } from './interface';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { batchDeleteClient, deleteClient, getClientList } from '@/api/client-list';
import ClientFormModal from './ClientForm';

const columns: TableProps<CompanyDataType>['columns'] = [
  {
    title: 'No.',
    key: 'index',
    align: 'center',
    width: 25,
    render(_value: string, _record: CompanyDataType, index: number) {
      return index + 1;
    },
  },
  {
    title: 'Enterprise',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
    width: 200,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 100,
    render(value: string) {
      const colorMap: Record<string, string> = {
        核准設立: 'green',
        停業: 'red',
        解散: 'orange',
        撤銷: 'purple',
        廢止: 'blue',
      };
      const color = colorMap[value] || 'default';
      return <Tag color={color}>{value}</Tag>;
    },
  },
  {
    title: 'Contact',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    align: 'center',
    width: 175,
  },
  {
    title: 'Industry Category',
    dataIndex: 'industryCategory',
    key: 'industryCategory',
    align: 'center',
    width: 175,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    align: 'center',
    width: 100,
  },
  {
    title: 'Unified Business Number',
    dataIndex: 'unifiedBusinessNumber',
    key: 'unifiedBusinessNumber',
    align: 'center',
    width: 120,
  },
  {
    title: 'Industry Code',
    dataIndex: 'industryCode',
    key: 'industryCode',
    align: 'center',
    width: 100,
  },
  {
    title: 'Responsible Person',
    dataIndex: 'responsiblePerson',
    key: 'responsiblePerson',
    align: 'center',
    width: 100,
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
  },
];

interface searchType {
  name: string;
  phone: string;
  contact: string;
}

const Users: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [dataList, setDataList] = useState<CompanyDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchName, setSearchName] = useState<string>('');
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchContact, setSearchContact] = useState<string>('');
  const [searchOpt, setSearchOpt] = useState<searchType>({
    name: '',
    phone: '',
    contact: '',
  });
  const [total, setTotal] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  // 定義 ModalMode 為有值域範圍的 string literal type
  type ModalMode = 'CREATE' | 'EDIT';
  const [mode, setMode] = useState<ModalMode>('CREATE');
  const [client, setClient] = useState<CompanyDataType | null>(null);

  const isBatchDeleteBtnDisabled = useMemo(() => {
    return selectedRowKeys && selectedRowKeys.length === 0;
  }, [selectedRowKeys]);
  const handleBatchDelete = async () => {
    try {
      const { data } = await batchDeleteClient([...selectedRowKeys]);
      message.success(data);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handlePageChange: PaginationProps['onChange'] = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  };

  const handleInputChange = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setValue(value);
  };

  const handleSearch = () => {
    setSearchOpt({
      name: searchName,
      phone: searchPhone,
      contact: searchContact,
    });
    setPage(1);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchPhone('');
    setSearchContact('');
    setSearchOpt({
      name: '',
      phone: '',
      contact: '',
    });
    setPage(1);
    setPageSize(10);
    setSelectedRowKeys([]);
  };

  const handleModalOpen = (title: string, client?: CompanyDataType) => {
    setModalTitle(title);
    setModalVisible(true);
    setMode(title === 'Create Client' ? 'CREATE' : 'EDIT');
    setClient(client || null);
  };

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setModalTitle('');
  }, []);

  const onCreate = () => {
    handleModalOpen('Create Client');
  };

  useEffect(() => {
    const loadData = async () => {
      // 模擬 API 請求
      try {
        setLoading(true);
        const {
          data: { list, total },
        } = await getClientList({
          ...searchOpt,
          page,
          pageSize,
        });

        setTotal(total);
        setDataList(list);
        // const preSelectedKeys = [...selectedRowKeys];
        // const selectedKeys = preSelectedKeys.length ?
        //   list.filter(item => preSelectedKeys
        //     .includes(item.id))
        //     .map(item => item.id) :
        //   [];
        setSelectedRowKeys([]);
      } catch (error) {
        message.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, pageSize, searchOpt, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { data } = await deleteClient(id);
      message.success(data);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const tableColumns: TableProps<CompanyDataType>['columns'] = useMemo(() => {
    const onEdit = (record: CompanyDataType) => {
      handleModalOpen('Edit Client', record);
    };

    return columns.map((column) => {
      if (column.key === 'action') {
        return {
          ...column,
          render: (_value, record: CompanyDataType) => (
            <>
              <Button type="primary" size="small" onClick={() => onEdit(record)}>
                Edit
              </Button>
              <Popconfirm
                title="Delete Item"
                description="Are you sure to delete this item?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleDelete(record.id)}
                onCancel={() => message.info('Delete cancelled')}
              >
                <Button type="primary" size="small" danger className="ml">
                  Delete
                </Button>
              </Popconfirm>
            </>
          ),
        };
      }
      return column;
    });
  }, []);

  return (
    <div className="users">
      <ClientFormModal
        visible={modalVisible}
        onClose={handleModalCancel}
        title={modalTitle}
        client={client}
        mode={mode}
        onRefresh={() => setRefreshTrigger((prev) => !prev)}
      />
      <Card className="search">
        <Row gutter={16}>
          <Col span={7}>
            <span>Enterprise</span>
            <Input
              name="name"
              value={searchName}
              onChange={(e) => handleInputChange(e.target.value, setSearchName)}
            />
          </Col>
          <Col span={7}>
            <span>Contact</span>
            <Input
              name="contact"
              value={searchContact}
              onChange={(e) => handleInputChange(e.target.value, setSearchContact)}
            />
          </Col>
          <Col span={7}>
            <span>Phone</span>
            <Input
              name="phone"
              value={searchPhone}
              onChange={(e) => handleInputChange(e.target.value, setSearchPhone)}
            />
          </Col>
          <Col span={3} style={{ paddingLeft: '30px' }}>
            <Button type="primary" style={{ marginRight: '8px' }} onClick={handleSearch}>
              Search
            </Button>
            <Button className="ml" onClick={handleReset}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>
      <Card className="mt tr">
        <Button type="primary" onClick={() => onCreate()}>
          New Enterprise
        </Button>
        <Button
          danger
          type="primary"
          className="ml"
          disabled={isBatchDeleteBtnDisabled}
          onClick={handleBatchDelete}
        >
          Batch Delete
        </Button>
      </Card>
      <Card className="mt">
        <Table
          columns={tableColumns}
          dataSource={dataList}
          loading={loading}
          rowKey={(record) => record.id}
          rowSelection={rowSelection}
          pagination={false}
        />
        <Pagination
          className="fr mt"
          total={total}
          current={page}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
          onChange={handlePageChange}
        />
      </Card>
    </div>
  );
};

export default Users;
