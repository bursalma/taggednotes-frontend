import { useEffect, useState } from "react";
import styled from "styled-components";
import { Spin, Tabs, Popconfirm } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Input, Modal } from "antd";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchSections,
  postSection,
  deleteSection,
  // addToDelete,
  selectSectionLoading,
  selectAllSections,
  selectSectionsToDelete,
} from "../redux/sectionSlice";
import Section from "./Section";
import SectionName from "./SectionName";

const SectionArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [postVal, setPostVal] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSectionLoading);
  const toDelete = useAppSelector(selectSectionsToDelete);
  const allSections = useAppSelector(selectAllSections);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  const handleCreate = () => {
    if (postVal) dispatch(postSection(postVal));
    setOpen(false);
  };

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <TabsContainer
          type="editable-card"
          onTabClick={(key) => setActiveTab(key)}
          onEdit={(_, action) => (action === "add" ? setOpen(true) : null)}
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
                    onConfirm={() => dispatch(deleteSection(Number(activeTab)))}
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
      <Modal
        visible={open}
        width={300}
        closable={false}
        okText="Create"
        onOk={handleCreate}
        onCancel={() => setOpen(false)}
      >
        <Input
          maxLength={30}
          onPressEnter={handleCreate}
          allowClear
          onChange={(e) => setPostVal(e.target.value)}
        />
      </Modal>
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
