import { useEffect } from "react";
import styled from "styled-components";
import { Spin, Tabs } from "antd";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchSections,
  selectSectionLoading,
  selectAllSections,
  selectSectionsToDelete,
} from "../redux/sectionSlice";
import Section from "./Section";

const SectionArea: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSectionLoading);
  const toDelete = useAppSelector(selectSectionsToDelete);
  const allSections = useAppSelector(selectAllSections);

  useEffect(() => {
    // dispatch(coordinator());
    dispatch(fetchSections());
  }, [dispatch]);

  return (
    <div>
      {loading === "loading" ? (
        <Spin size="large" />
      ) : (
        <TabsContainer type="editable-card" defaultActiveKey="default">
          {allSections
            .filter(({ id }) => !toDelete.includes(id))
            .map(({ id, name }) => (
              <Tabs.TabPane key={`${id}-tab`} tab={name} closable={true}>
                <Section key={`${id}-sec`} sectionId={id} />
              </Tabs.TabPane>
            ))}
        </TabsContainer>
      )}
    </div>
  );
};

const TabsContainer = styled(Tabs)`
  .ant-tabs-tab {
    background-color: darkblue !important;
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    background-color: blue !important;
  }

  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: lightblue;
  }
`;

export default SectionArea;
