import React from 'react';

interface WithPermissionsProps {
  userPermissions: string[];
}

function withPermissions<P>(requiredPermissions: string[]) {
  return (Component: React.ComponentType<Omit<P, 'userPermissions'>>) => {
    return (props: P & WithPermissionsProps) => {
      const { userPermissions, ...restProps } = props;
      const hasPermission = requiredPermissions.every((item) => userPermissions.includes(item));
      if (!hasPermission) return null;
      return <Component {...(restProps as Omit<P, 'userPermissions'>)} />;
    };
  };
}

export default withPermissions;
