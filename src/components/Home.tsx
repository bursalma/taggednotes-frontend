import { useEffect } from 'react';
import styled from 'styled-components';
import { BackTop, Spin, Tabs, Typography } from 'antd';

import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  selectSectionLoading,
  selectAllSections,
  selectSectionsToDelete } from '../redux/sectionSlice';
import { coordinator } from '../redux/homeSlice';
import Section from './Section';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSectionLoading);
  const toDelete = useAppSelector(selectSectionsToDelete);
  const allSections = useAppSelector(selectAllSections);

  useEffect(() => {
    dispatch(coordinator());
    // this is a test
  }, [dispatch]);

  return (
    <HomeContainer>
      <BackTop />
      {/* <Button onClick={() => dispatch(healthSet(false))}>not healthy</Button>
      <span>This is a test</span> */}
      <Typography.Title level={2}>taggednotes</Typography.Title>
      {loading === 'loading' ?
      <Spin size="large" /> :
      <TabsContainer type="editable-card" defaultActiveKey="default">
        {allSections
          .filter(({ id }) => !toDelete.includes(id))
          .map(({ id, name }) => 
            <Tabs.TabPane 
              key={`${id}-tab`} 
              tab={name} 
              closable={true}
            >
              <Section key={`${id}-sec`} sectionId={id} />
            </Tabs.TabPane>
          )
        }
      </TabsContainer>}
    </HomeContainer>
  );
}

const HomeContainer = styled.div`
  padding: 10px 30px;
`

const TabsContainer = styled(Tabs)`
  .ant-tabs-tab {
    background-color: darkblue !important;
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    background-color: blue !important;
  }

  .ant-tabs-tab.ant-tabs-tab-active 
    .ant-tabs-tab-btn {
    color: lightblue;
  }
`

export default Home;