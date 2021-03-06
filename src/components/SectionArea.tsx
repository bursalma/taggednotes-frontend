import { useEffect, useState } from "react";
import styled from "styled-components";
import { Tabs, Popconfirm, Input, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectIsAuthenticated } from "../redux/homeSlice";
import {
  fetchSections,
  postSection,
  deleteSection,
  selectAllSections,
} from "../redux/sectionSlice";
import Section from "./Section";
import SectionName from "./SectionName";

const SectionArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [postVal, setPostVal] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const allSections = useAppSelector(selectAllSections);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchSections());
  }, [dispatch, isAuthenticated]);

  const handleCreate = () => {
    if (postVal) dispatch(postSection(postVal));
    setOpen(false);
    setPostVal("");
  };

  return (
    <div>
      <TabsContainer
        type="editable-card"
        onTabClick={(key) => setActiveTab(key)}
        onEdit={(_, action) => (action === "add" ? setOpen(true) : null)}
      >
        {allSections.map(({ id, name }) => (
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
      <Modal
        visible={open}
        width={300}
        closable={false}
        okText="Create"
        onOk={handleCreate}
        onCancel={() => {
          setOpen(false);
          setPostVal("");
        }}
      >
        <Input
          value={postVal}
          maxLength={30}
          onPressEnter={handleCreate}
          allowClear
          onChange={(e) => setPostVal(e.target.value)}
          placeholder="Create Section"
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
