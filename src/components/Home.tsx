import { useEffect } from "react";
import styled from "styled-components";
import { BackTop, Typography, Button, Spin } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectHealth, selectStatus, statusSet } from "../redux/homeSlice";
import SectionArea from "./SectionArea";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const health = useAppSelector(selectHealth);
  const status = useAppSelector(selectStatus);

  const statusSwitch = {
    syncing: <Spin size="small" />,
    offline: <CloseCircleOutlined />,
    synced: <CheckCircleOutlined />,
  } as {
    [status: string]: JSX.Element;
  };

  useEffect(() => {
    console.log(health);
  }, [health]);

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <DetailsContainer>
          <Button onClick={() => dispatch(statusSet("syncing"))}>
            it be syncing
          </Button>
          {statusSwitch[status]}
        </DetailsContainer>
      </HeaderContainer>
      <SectionArea />
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  padding: 10px 30px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default Home;
