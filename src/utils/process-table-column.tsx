import { Button, message, Popconfirm } from 'antd';
import type { TableProps } from 'antd/es/table';

//
interface ProcessColumnsOptions<T extends { id: string | number }> {
  columns: TableProps<T>['columns'];
  onEdit: (record: T) => void;
  onDelete: (id: string | number) => void;
  actionColumnKey?: string;
  editText?: string;
  deleteText?: string;
  deleteTitle?: string;
  deleteDescription?: string;
}

export function processTableColumns<
  T extends { id: string | number }
>(
  options: ProcessColumnsOptions<T>
): TableProps<T>['columns'] {
  const {
    columns,
    actionColumnKey = 'action',
    editText = 'Edit',
    deleteText = 'Delete',
    deleteTitle = 'Delete Item',
    deleteDescription = 'Are you sure to delete this item?',
    onEdit,
    onDelete,
  } = options;

  return columns?.map(col => {
    if (col.key === actionColumnKey) {
      return {
        ...col,
        render: (_value, record) => (
          <>
            <Button
              type="primary"
              size="small"
              onClick={() => onEdit(record)}
            >
              {editText}
            </Button>
            <Popconfirm
              title={deleteTitle}
              description={deleteDescription}
              okText="Yes"
              cancelText="No"
              onConfirm={() => onDelete(record.id)}
              onCancel={() => message.info('Delete cancelled')}
            >
              <Button type="primary" size="small" danger className="ml">
                {deleteText}
              </Button>
            </Popconfirm>
          </>
        )
      };
    }
    return col;
  }) || [];
};
