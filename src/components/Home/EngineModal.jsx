import React, { useState } from 'react';
import Api from '../../api/Api';
import Dialog from '../common/Dialog.jsx';
import { Button } from '../common/Button.jsx';

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
    <Dialog open={show} onOpenChange={(open) => !open && close()} size="sm">
      <Dialog.Header onClose={() => close()}>エンジン制御</Dialog.Header>
      <Dialog.Body>
        <p>
          {engine?.engineStatus === 'OFF'
            ? 'エンジン制御を開始しますか'
            : 'エンジン制御を停止しますか'}
        </p>
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="outline" onClick={() => close()}>
          閉じる
        </Button>
        <Button variant="danger" onClick={() => handleConfirm()}>
          {engine?.engineStatus === 'ON' ? 'OFF' : 'ON'}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default EngineModal;
