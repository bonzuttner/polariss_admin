import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog.jsx';
import { Button } from './Button.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';

function ModalComponent({ name, id, close, userId }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const response = await Api.call({}, `${name}/${id}`, 'delete', userId);
      if (response.data?.code === 200) {
        navigate(`${name === 'users' ? '/setting/list' : '/setting'}`);
        window.location.reload();
      } else {
        toast.error(getApiErrorMessage(response, '削除に失敗しました。'));
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('削除に失敗しました。');
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !submitting && close()} size="sm">
      <Dialog.Header onClose={close} showClose={!submitting}>削除の確認</Dialog.Header>
      <Dialog.Body>削除を実施します</Dialog.Body>
      <Dialog.Footer>
        <Button variant="outline" onClick={close} disabled={submitting}>
          戻る
        </Button>
        <Button variant="danger" onClick={handleConfirm} loading={submitting}>
          削除
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default ModalComponent;
