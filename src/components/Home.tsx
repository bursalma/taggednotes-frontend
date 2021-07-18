// import { useEffect,useState } from "react";
import styled from "styled-components";
import { Avatar, BackTop, Button, Typography, Modal } from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
// import axios from "axios";

import { useAppSelector, useAppDispatch } from "../redux/store";
import {
  selectIsAuthenticated,
  selectStatus,
  isAuthenticatedSet,
} from "../redux/homeSlice";
import SectionArea from "./SectionArea";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  // const health = useAppSelector(selectHealth);
  const status = useAppSelector(selectStatus);
  let isAuthenticated = useAppSelector(selectIsAuthenticated);
  // const [token, setToken] = useState('')
  // isAuthenticated = true

  const statusSwitch = {
    syncing: <Avatar icon={<LoadingOutlined />} />,
    offline: <Avatar icon={<CloseOutlined />} />,
    synced: <Avatar icon={<CheckOutlined />} />,
  } as {
    [status: string]: JSX.Element;
  };

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

  return (
    <HomeContainer>
      <BackTop />
      <HeaderContainer>
        <Typography.Title level={2}>taggednotes</Typography.Title>
        <DetailsContainer>
          {statusSwitch[status]}
          <Button
            onClick={
              isAuthenticated
                ? () => dispatch(isAuthenticatedSet(false))
                : () => dispatch(isAuthenticatedSet(true))
            }
          >
            {isAuthenticated ? "Sign Out" : "Sign In/Up"}
          </Button>
        </DetailsContainer>
      </HeaderContainer>
      {isAuthenticated ? <SectionArea /> : null}
      <Modal></Modal>
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
