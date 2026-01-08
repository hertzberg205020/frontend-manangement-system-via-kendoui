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
} from '@ant-design/icons';

/**
 * 支援的 icon 名稱
 */
export type IconName =
  | 'DashboardOutlined'
  | 'UserOutlined'
  | 'UnorderedListOutlined'
  | 'UserAddOutlined'
  | 'SettingOutlined'
  | 'ProfileOutlined'
  | 'ToolOutlined'
  | 'LaptopOutlined'
  | 'InsertRowLeftOutlined'
  | 'BankOutlined'
  | 'TruckOutlined'
  | 'DollarOutlined'
  | 'FileTextOutlined'
  | 'FrownOutlined'
  | 'TransactionOutlined'
  | 'FundProjectionScreenOutlined'
  | 'FundViewOutlined'
  | 'ReadOutlined'
  | 'CommentOutlined'
  | 'ThunderboltOutlined'
  | 'TeamOutlined';

/**
 * icon 字串對應 AntD Icon 元件
 */
const icons: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  UserAddOutlined: <UserAddOutlined />,
  SettingOutlined: <SettingOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  ToolOutlined: <ToolOutlined />,
  LaptopOutlined: <LaptopOutlined />,
  InsertRowLeftOutlined: <InsertRowLeftOutlined />,
  BankOutlined: <BankOutlined />,
  TruckOutlined: <TruckOutlined />,
  DollarOutlined: <DollarOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  FrownOutlined: <FrownOutlined />,
  TransactionOutlined: <TransactionOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  FundViewOutlined: <FundViewOutlined />,
  ReadOutlined: <ReadOutlined />,
  CommentOutlined: <CommentOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  TeamOutlined: <TeamOutlined />,
};

export default icons;
