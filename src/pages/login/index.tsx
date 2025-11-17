import logo from '@/assets/logo.png';
import backgroundPicture from '@/assets/bg.jpg';
import loginBackground from '@/assets/login-background.png';
import './index.scss';
import { Button, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { getUserPermissions, login } from '@/api/users';
import { clearPermissions, clearToken, setPermissions, setToken } from '@/store/login/authSlice';
import { jwtDecode } from 'jwt-decode';
import JwtToken from '@/types/jwtPayload';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useAppDispatch } from '@/store';


function Login() {
  // hook
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundPicture})`,
  };


  const loginStyle: React.CSSProperties = {
    backgroundImage: `url(${loginBackground})`,
  };


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { token } = await login(values);

      // API contract: { token: string }
      if (!token) {
        message.error('登入失敗，未取得 token');
        setLoading(false);
        return;
      }

      // 解析 JWT payload（前端僅作解析，不驗證簽章）
      const payload = jwtDecode<Record<string, unknown>>(token);
      const jwt = new JwtToken(payload);

      if (jwt.isExpired()) {
        message.error('登入失敗：Token 已過期');
        setLoading(false);
        return;
      }

      // 儲存原始 token 到 Redux
      dispatch(setToken(token));

      const permissions = await getUserPermissions();
      dispatch(setPermissions(permissions));

      setLoading(false);
      // 導向首頁
      if (token) {
        navigate('/', { replace: true });
      }

    } catch (error) {
      setLoading(false);
      message.error('登入失敗，請稍後再試');
      console.error('Login failed:', error);
      dispatch(clearToken());
      dispatch(clearPermissions());
    }
  };

  return (
    <div className='login' style={backgroundStyle}>
      <div className='container'>
        <div className='login-background' style={loginStyle}>
        </div>
        <div className='part'>
          <div className="title">
            <div className="logo">
              <img src={logo} alt="Logo" width={100} />
            </div>
            <h1>管理平台</h1>
          </div>
          <Form
            form={form}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Account"
              name="account"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input placeholder='輸入帳號' prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder='輸入密碼' prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item label={null}>
              <Button type="primary" style={{ width: '100%' }} htmlType="submit" loading={loading}>
                登入
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

    </div>
  );
}

export default Login;
