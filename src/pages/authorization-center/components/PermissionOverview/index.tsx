import React from 'react';
import { Row, Col, Empty } from 'antd';

/**
 * @deprecated This component is deprecated and no longer used.
 * Permission management is now integrated into RoleManagement component.
 */
const PermissionOverview: React.FC = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Empty description="此組件已棄用，權限管理已整合到角色管理中" />
      </Col>
    </Row>
  );
};

export default PermissionOverview;
