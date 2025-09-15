import React from 'react';
import { Row, Col } from 'antd';
import type { Resource, Permission } from '../../types';
import PermissionCard from './PermissionCard';

interface PermissionOverviewProps {
  resources: Resource[];
  permissions: Permission[];
}

const PermissionOverview: React.FC<PermissionOverviewProps> = ({
  resources,
  permissions,
}) => {
  return (
    <Row gutter={[16, 16]}>
      {resources.map(resource => (
        <Col xs={24} sm={12} lg={6} key={resource.id}>
          <PermissionCard resource={resource} permissions={permissions} />
        </Col>
      ))}
    </Row>
  );
};

export default PermissionOverview;
