import { useState } from "react";
import { Input, Modal } from "antd";
import { useAppDispatch } from "../redux/store";

import { putSection } from "../redux/sectionSlice";

const SectionName: React.FC<{ sectionId: number; sectionName: string }> = ({
  sectionId,
  sectionName,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [putVal, setPutVal] = useState<string>(sectionName);
  const dispatch = useAppDispatch();

  const handleUpdate = () => {
    if (putVal && putVal !== sectionName)
      dispatch(putSection({ sectionId, putVal }));
    setOpen(false);
  };

  return (
    <div>
      <div onDoubleClick={() => setOpen(true)}>{sectionName}</div>
      <Modal
        visible={open}
        closable={false}
        okText="Update"
        onOk={handleUpdate}
        onCancel={() => setOpen(false)}
      >
        <Input
          defaultValue={sectionName}
          onChange={(e) => setPutVal(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default SectionName;
