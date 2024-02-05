import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';

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
    <Modal show={true} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>
      <Modal.Body>削除を実施します</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => close()}>
          戻る
        </Button>
        <Button
          className="btn btn-danger btn-sm"
          onClick={() => handleConfirm()}
        >
          削除
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalComponent;
