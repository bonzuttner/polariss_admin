import React from 'react';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from './Dialog.jsx';
import { Button } from './Button.jsx';

function ModalComponent({ name, id, close, userId }) {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    const response = await Api.call({}, `${name}/${id}`, 'delete', userId);
    if (response.data) {
      navigate(`${name === 'users' ? '/setting/list' : '/setting'}`);
      window.location.reload();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()} size="sm">
      <Dialog.Header onClose={close}>Modal title</Dialog.Header>
      <Dialog.Body>削除を実施します</Dialog.Body>
      <Dialog.Footer>
        <Button variant="outline" onClick={() => close()}>
          戻る
        </Button>
        <Button variant="danger" size="sm" onClick={() => handleConfirm()}>
          削除
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export default ModalComponent;
