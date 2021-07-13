import { useEffect } from 'react';
import styled from 'styled-components';
import { BackTop, Typography } from 'antd';

import { useAppDispatch, useAppSelector } from '../redux/store';
// import { 
  // fetchSections,
  // selectSectionLoading,
  // selectAllSections,
  // selectSectionsToDelete } from '../redux/sectionSlice';
import { selectHealth, selectStatus } from '../redux/homeSlice';
import SectionArea from './SectionArea';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const health = useAppSelector(selectHealth)
  const status = useAppSelector(selectStatus)

  useEffect(() => {
    // dispatch(coordinator());
    console.log(health)
    console.log(status)
  }, [dispatch, health, status]);

  return (
    <HomeContainer>
      <BackTop />

      {/* <Button onClick={() => dispatch(healthSet(false))}>not healthy</Button>
      <span>This is a test</span> */}
      <Typography.Title level={2}>taggednotes</Typography.Title>
      <SectionArea />
    </HomeContainer>
  );
}

const HomeContainer = styled.div`
  padding: 10px 30px;
`

export default Home;