import { useState } from "react";
import styled from "styled-components";
import { Avatar, BackTop, Button, Typography, Modal } from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useAppSelector, useAppDispatch } from "../redux/store";
import {
  selectIsAuthenticated,
  selectStatus,
  isAuthenticatedSet,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";
import SignInUp from "./SignInUp";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const status = useAppSelector(selectStatus);
  let isAuthenticated = useAppSelector(selectIsAuthenticated);

  // isAuthenticated = true

  const statusSwitch = {
    syncing: <Avatar icon={<LoadingOutlined />} />,
    offline: <Avatar icon={<CloseOutlined />} />,
    synced: <Avatar icon={<CheckOutlined />} />,
  } as {
    [status: string]: JSX.Element;
  };

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <DetailsContainer>
          {statusSwitch[status]}
          {isAuthenticated ? (
            <Button
              onClick={
                isAuthenticated
                  ? () => dispatch(isAuthenticatedSet(false))
                  : () => setOpen(true)
              }
            >
              {isAuthenticated ? "Sign Out" : "Sign In/Up"}
            </Button>
          ) : null}
        </DetailsContainer>
      </HeaderContainer>
      {isAuthenticated ? <SectionArea /> : <SignInUp />}
      <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <SignInUp />
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
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default Home;
