import logo from '@/assets/logo.png';
import backgroundPicture from '@/assets/bg.jpg';
import loginBackground from '@/assets/login-background.png';
import './index.scss';
import { Button, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/api/users';
import { setToken } from '@/store/login/authSlice';
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

      const result = await login(values);

      if (!result || typeof result !== 'object' || !('token' in result) || !('account' in result)) {
        // 處理 API 回傳異常
        message.error('登入失敗，請稍後再試。');
        // 這裡可顯示錯誤提示給使用者

        setLoading(false);
        return;
      }

      const { token, account } = await login(values);
      setLoading(false);

      // 將 token 存入 Redux store
      dispatch(setToken(token));
      // save account to sessionStorage
      sessionStorage.setItem('account', account);
      // 導向首頁
      navigate('/', { replace: true });
      // 處理登入成功
      console.log('Login successful:', token);

    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      // 處理登入失敗

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
