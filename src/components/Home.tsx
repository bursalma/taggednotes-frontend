// import { useState } from "react";
import styled from "styled-components";
import { Avatar, BackTop, Button, Typography, Space, Tooltip } from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useAppSelector, useAppDispatch } from "../redux/store";
import {
  selectIsAuthenticated,
  selectStatus,
  signedOut,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";
import SignInUp from "./SignInUp";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  // const [open, setOpen] = useState<boolean>(false);
  const status = useAppSelector(selectStatus);
  let isAuthenticated = useAppSelector(selectIsAuthenticated);

  // isAuthenticated = true

  const statusSwitch = {
    syncing: (
      <Tooltip title="syncing" placement="left" mouseEnterDelay={1}>
        <Avatar icon={<LoadingOutlined />} />
      </Tooltip>
    ),
    offline: (
      <Tooltip title="offline" placement="left" mouseEnterDelay={1}>
        <Avatar icon={<CloseOutlined />} />
      </Tooltip>
    ),
    synced: (
      <Tooltip title="synced" placement="left" mouseEnterDelay={1}>
        <Avatar icon={<CheckOutlined />} />
      </Tooltip>
    ),
  } as {
    [status: string]: JSX.Element;
  };

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <SettingsContainer>
          <Space>
            {statusSwitch[status]}
            {isAuthenticated ? (
              <Button type="primary" onClick={() => dispatch(signedOut())}>
                Sign Out
              </Button>
            ) : null}
          </Space>
        </SettingsContainer>
      </HeaderContainer>
      {isAuthenticated ? <SectionArea /> : <SignInUp />}
      {/* <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <SignInUp />
      </Modal> */}
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
