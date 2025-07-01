import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Api from '../../api/Api';

function EngineModal({ engine, updateEngine }) {
  const [show, setShow] = useState(true);

  const handleConfirm = async () => {
    const body =
      engine?.engineStatus === 'ON' ? { turnOn: false } : { turnOn: true };
    const response = await Api.call(
      body,
      `ibcDevices/${engine?.id}/engine`,
      'put',
      ''
    );
    if (response.data.code === 200) {
      close(response.data.data);
    }
  };

  const close = (updatedEngine) => {
    setShow(false);
    updateEngine(updatedEngine);
  };

  return (
    <Modal show={show} onHide={close} className={'monitoring-modal'}>
      <Modal.Header closeButton>
        <Modal.Title className={'fs-5'}>{`エンジン制御`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="fs-6">
          {engine?.engineStatus === 'OFF'
            ? 'エンジン制御を開始しますか'
            : 'エンジン制御を停止しますか'}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => close()}>
          閉じる
        </Button>
        <Button
          className="btn btn-danger btn-sm"
          onClick={() => handleConfirm()}
        >
          {engine?.engineStatus === 'ON' ? 'OFF' : 'ON'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EngineModal;
