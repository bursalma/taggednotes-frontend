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
  signedOut,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";
import SignInUp from "./SignInUp";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const username = useAppSelector(selectUsername);
  const status = useAppSelector(selectStatus);
  let isAuthenticated = useAppSelector(selectIsAuthenticated);

  // isAuthenticated = true

  useEffect(() => {
    dispatch(fetchHealth());
  }, [dispatch]);

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
      <Menu.Item onClick={() => setOpen(true)}>Account</Menu.Item>
      <Menu.Item onClick={() => dispatch(signedOut())}>Sign Out</Menu.Item>
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
            {isAuthenticated ? (
              <Dropdown.Button
                type="primary"
                placement="bottomRight"
                overlay={menu}
                onClick={() => setOpen(true)}
              >
                {username}
              </Dropdown.Button>
            ) : null}
          </Space>
        </SettingsContainer>
      </HeaderContainer>
      {isAuthenticated ? <SectionArea /> : <SignInUp />}
      <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        hello
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
