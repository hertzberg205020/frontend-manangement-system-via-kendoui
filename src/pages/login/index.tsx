import logo from '@/assets/logo.png';
import backgroundPicture from '@/assets/bg.jpg';
import loginBackground from '@/assets/login-background.png';
import './index.scss';
import { Button, Form, Input } from 'antd';
import { Icons } from '@/ui';
import { getUserPermissions, login } from '@/api/users';
import { clearPermissions, clearToken, setPermissions, setToken } from '@/store/login/authSlice';
import { jwtDecode } from 'jwt-decode';
import JwtToken from '@/types/jwtPayload';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useAppDispatch } from '@/store';
import { notify } from '@/ui';

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
        notify.error('登入失敗，未取得憑證');
        setLoading(false);
        return;
      }

      // 解析 JWT payload（前端僅作解析，不驗證簽章）
      const payload = jwtDecode<Record<string, unknown>>(token);
      const jwt = new JwtToken(payload);

      if (jwt.isExpired()) {
        notify.error('登入憑證已過期，請重新登入');
        setLoading(false);
        return;
      }

      // 儲存原始 token 到 Redux
      dispatch(setToken(token));

      try {
        const permissions = await getUserPermissions();
        dispatch(setPermissions(permissions));
      } catch {
        // If fetching permissions fails, clear token and show error
        dispatch(clearToken());
        notify.error('無法載入使用者權限，請稍後再試');
        setLoading(false);
        return;
      }

      setLoading(false);
      // 導向首頁
      if (token) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setLoading(false);

      // Handle LoginError with specific messages
      if (error && typeof error === 'object' && 'name' in error && error.name === 'LoginError') {
        const loginError = error as unknown as { message: string; type: string };

        // Display error message based on error type
        switch (loginError.type) {
          case 'auth':
            notify.error({
              content: loginError.message,
              duration: 5,
              key: 'login-auth-error',
            });
            break;
          case 'validation':
            notify.warning({
              content: loginError.message,
              duration: 4,
              key: 'login-validation-error',
            });
            break;
          case 'network':
            notify.error({
              content: loginError.message,
              duration: 6,
              key: 'login-network-error',
            });
            break;
          default:
            notify.error({
              content: loginError.message,
              duration: 5,
              key: 'login-error',
            });
        }
      } else {
        // Fallback for unknown errors
        notify.error({
          content: '登入過程發生錯誤，請稍後再試',
          duration: 5,
          key: 'login-unknown-error',
        });
      }

      console.error('Login failed:', error);
      dispatch(clearToken());
      dispatch(clearPermissions());
    }
  };

  return (
    <div className="login" style={backgroundStyle}>
      <div className="container">
        <div className="login-background" style={loginStyle}></div>
        <div className="part">
          <div className="title">
            <div className="logo">
              <img src={logo} alt="Logo" width={100} />
            </div>
            <h1>管理平台</h1>
          </div>
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              label="Account"
              name="account"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input placeholder="輸入帳號" prefix={<Icons.User />} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="輸入密碼" prefix={<Icons.Lock />} />
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
