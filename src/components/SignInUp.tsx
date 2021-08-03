import { useState } from "react";
import styled from "styled-components";
import { Form, Input, Button, Divider, Space, Modal } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

import { useAppDispatch } from "../redux/store";
import { signIn, signUp } from "../redux/homeSlice";

const SignInUp: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <Button type="primary" onClick={() => setOpen(true)}>
        Sign In/Up
      </Button>
      <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <SignInUpContainer>
          <Space size="large">
            <SignInContainer
              name="sign-in"
              initialValues={{ remember: true }}
              onFinish={(data) => dispatch(signIn(data))}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your Username!" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Sign In
                </Button>
              </Form.Item>
            </SignInContainer>

            <Divider type="vertical" style={{ height: "150px" }} />

            <SignUpContainer
              name="sign-up"
              initialValues={{ remember: true }}
              onFinish={(data) => dispatch(signUp(data))}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your Username!" },
                  { min: 3, message: 'Username must be minimum 3 characters.' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { type: "email", message: "The input is not valid E-mail!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="E-mail" />
              </Form.Item>
              <Form.Item
                name="password1"
                hasFeedback
                rules={[
                  { required: true, message: "Please input your Password!" },
                  { min: 8, message: 'Password must be minimum 8 characters.' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item
                name="password2"
                hasFeedback
                rules={[
                  { required: true, message: "Please input your Password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password1") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Confirm Password"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Sign Up
                </Button>
              </Form.Item>
            </SignUpContainer>
          </Space>
        </SignInUpContainer>
      </Modal>
    </div>
  );
};

const SignInUpContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const SignInContainer = styled(Form)`
  max-width: 300px;
`;

const SignUpContainer = styled(Form)`
  max-width: 300px;
`;

export default SignInUp;
