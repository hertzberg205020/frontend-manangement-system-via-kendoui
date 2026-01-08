/**
 * @fileoverview Icon facade for unified icon usage across the application
 * @description Provides a consistent API for displaying icons.
 * Currently uses Ant Design icons as the backend implementation, but can be swapped for Kendo SVG icons later.
 * @author Graham
 * @since 1.0.0
 */

import React from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  SettingOutlined,
  ProfileOutlined,
  ToolOutlined,
  LaptopOutlined,
  InsertRowLeftOutlined,
  BankOutlined,
  TruckOutlined,
  DollarOutlined,
  FileTextOutlined,
  FrownOutlined,
  TransactionOutlined,
  FundProjectionScreenOutlined,
  FundViewOutlined,
  ReadOutlined,
  CommentOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  LockOutlined,
  DownOutlined,
  PoweroffOutlined,
  MoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
  KeyOutlined,
  UndoOutlined,
  RadarChartOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

/**
 * Supported icon names
 * @since 1.0.0
 */
export type IconName =
  | 'dashboard'
  | 'user'
  | 'list'
  | 'userAdd'
  | 'setting'
  | 'profile'
  | 'tool'
  | 'laptop'
  | 'insertRowLeft'
  | 'bank'
  | 'truck'
  | 'dollar'
  | 'fileText'
  | 'frown'
  | 'transaction'
  | 'fundProjectionScreen'
  | 'fundView'
  | 'read'
  | 'comment'
  | 'thunderbolt'
  | 'team'
  | 'lock'
  | 'down'
  | 'poweroff'
  | 'more'
  | 'plus'
  | 'edit'
  | 'delete'
  | 'safety'
  | 'key'
  | 'undo'
  | 'radarChart'
  | 'snippets';

/**
 * Properties for the AppIcon component
 * @since 1.0.0
 */
export interface AppIconProps extends Omit<AntdIconProps, 'icon'> {
  /** The name of the icon to display */
  name: IconName;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Icon name to component mapping
 * Maps semantic icon names to their Ant Design implementations
 * @since 1.0.0
 */
const iconMap: Record<IconName, React.ComponentType<AntdIconProps>> = {
  dashboard: DashboardOutlined,
  user: UserOutlined,
  list: UnorderedListOutlined,
  userAdd: UserAddOutlined,
  setting: SettingOutlined,
  profile: ProfileOutlined,
  tool: ToolOutlined,
  laptop: LaptopOutlined,
  insertRowLeft: InsertRowLeftOutlined,
  bank: BankOutlined,
  truck: TruckOutlined,
  dollar: DollarOutlined,
  fileText: FileTextOutlined,
  frown: FrownOutlined,
  transaction: TransactionOutlined,
  fundProjectionScreen: FundProjectionScreenOutlined,
  fundView: FundViewOutlined,
  read: ReadOutlined,
  comment: CommentOutlined,
  thunderbolt: ThunderboltOutlined,
  team: TeamOutlined,
  lock: LockOutlined,
  down: DownOutlined,
  poweroff: PoweroffOutlined,
  more: MoreOutlined,
  plus: PlusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  safety: SafetyOutlined,
  key: KeyOutlined,
  undo: UndoOutlined,
  radarChart: RadarChartOutlined,
  snippets: SnippetsOutlined,
};

/**
 * AppIcon component
 * Unified icon component that can be easily swapped to use KendoReact SVG icons
 * @param props - Icon properties
 * @returns React icon component
 * @since 1.0.0
 * @example
 * ```tsx
 * // Basic usage
 * <AppIcon name="user" />
 *
 * // With custom styling
 * <AppIcon name="dashboard" className="my-icon" style={{ fontSize: '24px', color: 'blue' }} />
 *
 * // With size
 * <AppIcon name="edit" style={{ fontSize: '16px' }} />
 * ```
 */
export const AppIcon: React.FC<AppIconProps> = ({ name, className, style, ...restProps }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return <IconComponent className={className} style={style} {...restProps} />;
};

export default AppIcon;
