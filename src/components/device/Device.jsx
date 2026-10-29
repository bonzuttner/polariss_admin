import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import ModalComponent from '../common/ModalComponent';
import Utils from '../utils/utils.js';
import Card from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import Dialog from '../common/Dialog.jsx';
import FormRow from '../common/FormRow.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import { inputClass } from '../../styles/formClasses.js';
import { getApiErrorMessage } from '../../utils/apiError.js';

function Device(props) {
  const component = props.component;
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;
  const [device, setDevice] = useState({});
  const [user, setUser] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    try {
      setPageLoading(true);
      setLoadError(null);
      const responseUser = await Api.call(
        {},
        `users/${userId}`,
        'get',
        localStorage.getItem('userId')
      );

      if (responseUser.data?.code === 200) {
        let userData = responseUser.data.data;
        let selectedDevice = id ? userData.devices.find((a) => a.imsi == id) : {};
        selectedDevice.userId = userId;
        setUser(userData);
        setDevice(selectedDevice);
      } else {
        setLoadError(getApiErrorMessage(responseUser, 'デバイス情報の取得に失敗しました。'));
      }
    } catch (err) {
      console.error('Error fetching device:', err);
      setLoadError('デバイス情報の取得に失敗しました。通信状態を確認してください。');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleChange = (value, field) => {
    setDevice({ ...device, [field]: value });
  };

  const updateDevice = async () => {
    let path = `devices`;
    let request_type = id ? `put` : `post`;
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    device.userId = userId;
    device.type = 'SKGM01';
    device.sortNo = 1;
    if (!device.bikeId) {
      device.bikeId = user.bikes[0].id;
    }
    setSubmitting(true);
    try {
      const response = await Api.call(
        device,
        path,
        request_type,
        localStorage.getItem('userId')
      );
      if (response.data?.code === 200) {
        setError('');
        setShowConfirm(false);
        if (props.component === 'setup') {
          props.changeForm();
          navigate('/setting');
          window.location.reload(false);
        } else {
          navigate('/setting');
          window.location.reload(false);
        }
      } else {
        setShowConfirm(false);
        const message = getApiErrorMessage(response, 'デバイス情報の保存に失敗しました。');
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Error saving device:', err);
      setShowConfirm(false);
      setError('デバイス情報の保存に失敗しました。');
      toast.error('デバイス情報の保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <PageLoader label="デバイス情報を読み込み中..." className="py-24" />;
  }

  if (loadError) {
    return (
      <div className="mx-auto my-10 w-full max-w-xl px-4">
        <ErrorState message={loadError} onRetry={getUserData} />
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 w-full max-w-xl px-4">
      <ErrorBanner>{error}</ErrorBanner>

      <Card>
        <Card.Header>
          <h4 className="text-lg font-semibold text-text">デバイスデータ</h4>
        </Card.Header>

        <Card.Body className="flex flex-col gap-4">
          <FormRow label="userID" htmlFor="userId">
            <input
              className={inputClass}
              id="userId"
              value={device?.userId || ''}
              onChange={(event) => handleChange(event.target.value, 'userId')}
            />
          </FormRow>

          <FormRow label="Sim Number" htmlFor="name">
            <input
              className={inputClass}
              id="name"
              value={device?.name || ''}
              onChange={(event) => handleChange(event.target.value, 'name')}
            />
          </FormRow>

          {id && (
            <FormRow label="imsi" htmlFor="imsi">
              <input className={inputClass} id="imsi" disabled value={device?.imsi || ''} />
            </FormRow>
          )}

          <FormRow label="deviceType" htmlFor="type">
            <select
              className={inputClass}
              id="type"
              value={device?.type || 'SKGM01'}
              disabled
              onChange={() => {}}
            >
              <option key={Utils.unique()} value="SKB001"> SKB001 </option>
              <option key={Utils.unique()} value="SKG001"> SKG001 </option>
              <option key={Utils.unique()} value="SKGM01"> SKGM01 </option>
              <option key={Utils.unique()} value="SKGTL01"> SKGTL01 </option>
            </select>
          </FormRow>

          <FormRow label="bikeID" htmlFor="bikeId">
            <select
              className={inputClass}
              id="bikeId"
              onChange={(event) => handleChange(parseInt(event.target.value), 'bikeId')}
              value={device?.bikeId || ''}
            >
              {user?.bikes?.map((bike) => (
                <option key={Utils.unique()} value={bike.id}>{bike.name}</option>
              ))}
            </select>
          </FormRow>

          <FormRow label="stopFLG" htmlFor="stopFLG">
            <select className={inputClass} id="stopFLG" value={device?.stopFLG || '0'} disabled onChange={() => {}}>
              <option key={Utils.unique()} value="0"> 有効 </option>
              <option key={Utils.unique()} value="9"> 停止 </option>
            </select>
          </FormRow>

          <div className={`mt-2 flex ${props.component !== 'setup' ? 'justify-between' : 'justify-end'}`}>
            {props.component !== 'setup' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(type === 'info' ? '/setting/user-info' : '/setting')}
                disabled={submitting}
              >
                戻る
              </Button>
            )}
            <div className="flex items-center gap-3">
              {id && (
                <Button variant="danger" size="sm" onClick={() => setShow(true)} disabled={submitting}>
                  削除
                </Button>
              )}
              <Button
                onClick={() => (component === 'setup' ? updateDevice() : setShowConfirm(true))}
                loading={component === 'setup' && submitting}
              >
                更新
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm} size="sm">
        <Dialog.Header onClose={() => setShowConfirm(false)}>確認</Dialog.Header>
        <Dialog.Body>更新を実施します</Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
            戻る
          </Button>
          <Button onClick={updateDevice} loading={submitting}>更新</Button>
        </Dialog.Footer>
      </Dialog>

      {show && (
        <ModalComponent
          name={'devices'}
          id={device?.name}
          close={() => setShow(false)}
          userId={localStorage.getItem('userId')}
        />
      )}
    </div>
  );
}

export default Device;
