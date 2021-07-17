import { useEffect, useState } from "react";
import styled from "styled-components";
import { Spin, Tabs, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchSections,
  addToDelete,
  selectSectionLoading,
  selectAllSections,
  selectSectionsToDelete,
} from "../redux/sectionSlice";
import Section from "./Section";
import SectionName from "./SectionName";

const SectionArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSectionLoading);
  const toDelete = useAppSelector(selectSectionsToDelete);
  const allSections = useAppSelector(selectAllSections);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  const handleEdit = (targetKey: any, action: string) => {
    if (action === "add") {
      console.log("add");
    }
  };

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <TabsContainer
          type="editable-card"
          onTabClick={(key) => setActiveTab(key)}
          onEdit={(targetKey, action) => handleEdit(targetKey, action)}
        >
          {allSections
            .filter(({ id }) => !toDelete.includes(id))
            .map(({ id, name }) => (
              <Tabs.TabPane
                key={id}
                tab={
                  <SectionName
                    key={`${id}-name`}
                    sectionId={id}
                    sectionName={name}
                  />
                }
                closable={activeTab === String(id) ? true : false}
                closeIcon={
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    okText="Delete"
                    onConfirm={() => dispatch(addToDelete(Number(activeTab)))}
                  >
                    <CloseOutlined />
                  </Popconfirm>
                }
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
