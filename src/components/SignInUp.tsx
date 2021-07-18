import styled from "styled-components";
// import axios from "axios";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const SignInUp: React.FC = () => {
  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };

  return (
    <SignInUpContainer>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          Forgot password
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          Or register now!
        </Form.Item>
      </Form>
    </SignInUpContainer>
  );
};

const SignInUpContainer = styled.div`
  #components-form-demo-normal-login .login-form {
    max-width: 300px;
  }
  #components-form-demo-normal-login .login-form-forgot {
    float: right;
  }
  #components-form-demo-normal-login .ant-col-rtl .login-form-forgot {
    float: left;
  }
  #components-form-demo-normal-login .login-form-button {
    width: 100%;
  }
`;

export default SignInUp;

// const [token, setToken] = useState('')

// useEffect(() => {
//   console.log(health);

//   const http = axios.create({
//     baseURL: process.env.REACT_APP_SERVER_URL,
//     timeout: 10000,
//     headers: {
//       "content-type": "application/json",
//       // "WWW-Authenticate": token
//       //   'app-id': 'GET-THE-SECRET-KEY'
//     },
//   });

//   let data = {
//     username: 'user1',
//     password: 'test.123'
//   }

//   http.post('auth/login/', data).then(res => setToken(res.data.key))

//   console.log(token)

//   const http2 = axios.create({
//     baseURL: process.env.REACT_APP_SERVER_URL,
//     timeout: 10000,
//     headers: {
//       "content-type": "application/json",
//       "Authorization" : `Token ${token}`,
//       // "WWW-Authenticate": token
//     },
//   });

//   http2.get('auth/user/').then(res => console.log(res))
// }, []);
