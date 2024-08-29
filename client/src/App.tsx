import React, { useState } from "react";
import { Button, Modal } from "antd";
import { Stepper } from "./components";

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={1000}
      >
        <Stepper />
      </Modal>
    </>
  );
};

export default App;
