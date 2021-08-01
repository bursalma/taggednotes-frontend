import { Dropdown, Menu, Modal } from "antd";
import { useState } from "react";
import { selectUsername, signOut } from "../redux/homeSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

const UserInfo: React.FC = () => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const username = useAppSelector(selectUsername);

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setOpen(true)}>
        Account
      </Menu.Item>
      <Menu.Item key={2} onClick={() => dispatch(signOut())}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Dropdown.Button
        type="primary"
        placement="bottomRight"
        overlay={menu}
        onClick={() => setOpen(true)}
      >
        {username}
      </Dropdown.Button>

      <Modal
        visible={open}
        // width={1000}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <span>username: {username}</span>
      </Modal>
    </div>
  );
};

export default UserInfo;
