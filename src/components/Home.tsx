import { useState, useEffect } from "react";
import styled from "styled-components";
import { Avatar, BackTop, Typography, Space, Tooltip, Spin } from "antd";
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
  authSetup,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";
import SignInUp from "./SignInUp";
import UserInfo from "./UserInfo";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const status = useAppSelector(selectStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect((): any => {
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

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <SettingsContainer>
          <Space>
            {statusSwitch[status]}
            {loading ? null : isAuthenticated ? <UserInfo /> : <SignInUp />}
          </Space>
        </SettingsContainer>
      </HeaderContainer>
      {loading ? <Spin size="large" /> : <SectionArea />}
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
