import {
  RadarChartOutlined,
  SnippetsOutlined,
  DollarOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import './index.scss';

export const icons: Record<string, React.ReactNode> = {
  RadarChartOutlined: <RadarChartOutlined className="icon" style={{ color: '#7da1f7' }} />,
  SnippetsOutlined: <SnippetsOutlined className="icon" style={{ color: '#81c452' }} />,
  DollarOutlined: <DollarOutlined className="icon" style={{ color: '#62c9cb' }} />,
  LaptopOutlined: <LaptopOutlined className="icon" style={{ color: '#e49362' }} />
};
