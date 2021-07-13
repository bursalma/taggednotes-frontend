import { useEffect, useState } from "react";
import styled from "styled-components";
import { Spin, Tabs } from "antd";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchSections,
  addToDelete,
  selectSectionLoading,
  selectAllSections,
  selectSectionsToDelete,
} from "../redux/sectionSlice";
import Section from "./Section";

const SectionArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSectionLoading);
  const toDelete = useAppSelector(selectSectionsToDelete);
  const allSections = useAppSelector(selectAllSections);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  const onEdit = (targetKey: any, action: string) => {
    if (action === 'add') {
      console.log('add')
    } else {
      dispatch(addToDelete(Number(targetKey)))
    }
  }

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <TabsContainer
          type="editable-card"
          onTabClick={(key) => setActiveTab(key)}
          onEdit={(targetKey, action) => onEdit(targetKey, action) }
        >
          {allSections
            .filter(({ id }) => !toDelete.includes(id))
            .map(({ id, name }) => (
              <Tabs.TabPane
                key={id}
                tab={name}
                closable={activeTab === String(id) ? true : false}
              >
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
