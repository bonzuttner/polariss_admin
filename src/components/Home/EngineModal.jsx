import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import Dialog from '../common/Dialog.jsx';
import { Button } from '../common/Button.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';

function EngineModal({ engine, updateEngine }) {
  const [show, setShow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    const body =
      engine?.engineStatus === 'ON' ? { turnOn: false } : { turnOn: true };
    setSubmitting(true);
    try {
      const response = await Api.call(
        body,
        `ibcDevices/${engine?.id}/engine`,
        'put',
        ''
      );
      if (response.data?.code === 200) {
        close(response.data.data);
      } else {
        toast.error(getApiErrorMessage(response, 'エンジン制御の切り替えに失敗しました。'));
      }
    } catch (err) {
      console.error('Error toggling engine:', err);
      toast.error('エンジン制御の切り替えに失敗しました。');
    } finally {
      setSubmitting(false);
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
        <Button variant="outline" onClick={() => close()} disabled={submitting}>
          閉じる
        </Button>
        <Button variant="danger" onClick={() => handleConfirm()} loading={submitting}>
          {engine?.engineStatus === 'ON' ? 'OFF' : 'ON'}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default EngineModal;
