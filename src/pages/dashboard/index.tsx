import { Card, Col, Progress, Row, Statistic, Tag, Timeline } from 'antd';
import { icons } from './icons';
import './index.scss';
import EnergyFigure from './EnergyFigure';
import BarFigure from './BarFigure';
import PieFigure from './PieFigure';

interface CardInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const cardData: CardInfo[] = [
  {
    title: '13479',
    description: '園區總面積(平方公尺)',
    icon: icons.RadarChartOutlined,
  },
  {
    title: '8635',
    description: '總租賃面積(平方公尺)',
    icon: icons.SnippetsOutlined,
  },
  {
    title: '38764',
    description: '園區總產值(萬元新台幣)',
    icon: icons.DollarOutlined,
  },
  {
    title: '2874',
    description: '入駐企業數量(家)',
    icon: icons.LaptopOutlined,
  },
];

const items: { children: React.ReactNode; color?: string }[] = [
  {
    children: (
      <>
        <Tag color="green">Entry</Tag>08:24 Vehicle A66666
      </>
    ),
  },
  {
    children: (
      <>
        <Tag color="red">Exit</Tag>09:15 Vehicle A66666
      </>
    ),
    color: 'red',
  },
  {
    children: (
      <>
        <Tag color="green">Entry</Tag>09:22 Vehicle A23456
      </>
    ),
  },
  {
    children: (
      <>
        <Tag color="red">Exit</Tag>10:43 Vehicle A18763
      </>
    ),
    color: 'red',
  },
  {
    children: (
      <>
        <Tag color="green">Entry</Tag>13:38 Vehicle A88888
      </>
    ),
  },
  {
    children: (
      <>
        <Tag color="green">Entry</Tag>14:46 Vehicle A23456
      </>
    ),
  },
];

const generateCards = (data: CardInfo[]) => {
  return data.map((item, index) => (
    <Col span={6} key={index}>
      <Card className="clearfix">
        <div className="fl area">
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
        <div className="fr">{item.icon}</div>
      </Card>
    </Col>
  ));
};

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Row gutter={16}>{generateCards(cardData)}</Row>
      <Row gutter={16} className="mt">
        <Col span={12}>
          <Card title="園區能耗概況" className="card">
            <EnergyFigure />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="園區產值概況" className="card">
            <BarFigure />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} className="mt">
        <Col span={12}>
          <Card title="Rental Status">
            {/* PieFigure */}
            <PieFigure />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Charging Pile Availability Statistics">
            <div className="wrap" style={{ paddingTop: '60px' }}>
              <Progress type="circle" percent={75} />
              <Statistic title="Total Charging Piles" value={75} suffix="/ 100" className="mt" />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Real-time Vehicle Information" style={{ height: '406px' }}>
            <div className="wrap" style={{ paddingTop: '45px' }}>
              <Timeline items={items} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
