import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store';
import { clearToken } from '@/store/login/authSlice';
import { clearTabsStorage } from '@/store/tabs/tabsSlice';
import { DownOutlined, PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space, type MenuProps } from 'antd';
import { useNavigate } from 'react-router';

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <a target="_blank">
        Personal Center
      </a>
    ),
    icon: <UserOutlined />,
  },
  {
    key: '2',
    label: (
      <a target="_blank" >
        Logout
      </a>
    ),
    icon: <PoweroffOutlined />,
  },
];




const LayoutHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { name = '', sub: empId = '' } = userInfo ?? {};
  const account = `${empId} ${name}`.trim();

  const onClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case '1':
        // Handle personal settings
        console.log('Personal Settings clicked');
        // Navigate to personal settings page
        navigate('/user-profile');
        break;
      case '2':
        // Handle logout
        console.log('Logout clicked');
        dispatch(clearToken());
        dispatch(clearTabsStorage()); // clear the persistent tabs state
        // Clear session storage
        sessionStorage.clear();
        break;
      default:
        console.log('Unknown action');
    }
  };

  return (
    <div>
      <Dropdown menu={{ items, onClick }} >
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            Welcome, {account || 'Guest'}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    </div>
  );
};

export default LayoutHeader;
