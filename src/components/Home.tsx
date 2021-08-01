import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Avatar,
  BackTop,
  Dropdown,
  Menu,
  Typography,
  Space,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useAppSelector, useAppDispatch } from "../redux/store";
import {
  fetchHealth,
  selectIsAuthenticated,
  selectStatus,
  selectUsername,
  signOut,
  authSetup,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";
import SignInUp from "./SignInUp";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const username = useAppSelector(selectUsername);
  const status = useAppSelector(selectStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect((): any => {
    setOpen(false);
    dispatch(fetchHealth());
    if (isAuthenticated) dispatch(authSetup());
    setLoading(false);
  }, [dispatch, isAuthenticated]);

  const BaseStatusSwitch = (title: string, icon: JSX.Element) => (
    <Tooltip title={title} placement="left" mouseEnterDelay={1}>
      <Avatar icon={icon} />
    </Tooltip>
  );

  const statusSwitch = {
    syncing: BaseStatusSwitch("syncing", <LoadingOutlined />),
    offline: BaseStatusSwitch("offline", <CloseOutlined />),
    synced: BaseStatusSwitch("synced", <CheckOutlined />),
  } as {
    [status: string]: JSX.Element;
  };

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setOpen(true)}>
        Account
      </Menu.Item>
      <Menu.Item key={2} onClick={() => dispatch(signOut())}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <SettingsContainer>
          <Space>
            {statusSwitch[status]}
            {loading ? null : (
              <Dropdown.Button
                type="primary"
                placement="bottomRight"
                overlay={isAuthenticated ? menu : <div></div>}
                onClick={() => setOpen(true)}
              >
                {isAuthenticated ? username : "Sign In/Up"}
              </Dropdown.Button>
            )}
          </Space>
        </SettingsContainer>
      </HeaderContainer>
      {loading ? <Spin size="large" /> : <SectionArea />}
      <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        {isAuthenticated ? <span>username: {username}</span> : <SignInUp />}
      </Modal>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  padding: 10px 30px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export default Home;

/* <Modal
  visible={open}
  // width={1000}
  closable={false}
  footer={null}
  onCancel={() => setOpen(false)}
>
  <SignInUp />
</Modal> */
