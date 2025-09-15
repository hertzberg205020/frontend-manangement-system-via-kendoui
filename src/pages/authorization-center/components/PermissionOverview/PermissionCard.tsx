import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import type { Resource, Permission } from '../../types';
import { getActionText } from '../../utils';

const { Text } = Typography;

interface PermissionCardProps {
  resource: Resource;
  permissions: Permission[];
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  resource,
  permissions,
}) => {
  const resourcePermissions = permissions.filter(
    p => p.resource_id === resource.id
  );

  return (
    <Card
      title={resource.description}
      size="small"
      extra={<Tag color="green">啟用</Tag>}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {resourcePermissions.map(permission => (
          <div
            key={permission.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text type="secondary">{getActionText(permission.action)}</Text>
            <Tag>{permission.description}</Tag>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default PermissionCard;
