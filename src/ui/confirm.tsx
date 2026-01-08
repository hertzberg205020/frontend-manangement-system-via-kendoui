/**
 * @fileoverview Confirmation dialog component
 * @description Provides Popconfirm component wrapper for declarative usage
 * Currently uses Ant Design as the backend implementation, but can be swapped for KendoReact later.
 * @author Graham
 * @since 1.0.0
 */

import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps as AntPopconfirmProps } from 'antd';

/**
 * Properties for the Popconfirm component wrapper
 * Re-exports AntD Popconfirm props for compatibility
 * @since 1.0.0
 */
export interface PopconfirmProps extends Omit<AntPopconfirmProps, 'title'> {
  /** The title of the popconfirm */
  title: React.ReactNode;
  /** The description text */
  description?: React.ReactNode;
  /** Callback when user confirms */
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void;
  /** Callback when user cancels */
  onCancel?: (e?: React.MouseEvent<HTMLElement>) => void;
  /** Text for the OK button */
  okText?: string;
  /** Text for the Cancel button */
  cancelText?: string;
  /** The content to be wrapped */
  children: React.ReactNode;
}

/**
 * Declarative Popconfirm component
 * Wraps content with a confirmation popover that appears on click
 * @param props - Popconfirm properties
 * @returns React component
 * @since 1.0.0
 * @example
 * ```tsx
 * <Popconfirm
 *   title="Delete Item"
 *   description="Are you sure to delete this item?"
 *   onConfirm={() => handleDelete(id)}
 *   onCancel={() => notify.info('Delete cancelled')}
 *   okText="Yes"
 *   cancelText="No"
 * >
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 * ```
 */
export const Popconfirm: React.FC<PopconfirmProps> = (props) => {
  return <AntPopconfirm {...props} />;
};

export default Popconfirm;
