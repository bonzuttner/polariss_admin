import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import Utils from "../utils/utils.js";
import styles from './Device.module.css'; // Create this CSS module

function Device(props) {
  const component = props.component;
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;
  const [device, setDevice] = useState({});
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const getUserData = async () => {
    let userId =
        type === 'info'
            ? localStorage.getItem('userProfileId')
            : localStorage.getItem('userId');
    const responseUser = await Api.call(
        {},
        `users/${userId}`,
        'get',
        localStorage.getItem('userId')
    );

    if (responseUser.data) {
      let userData = responseUser.data.data;
      let selectedDevice = id ? userData.devices.find((a) => a.imsi == id) : {};
      selectedDevice.userId = userId;
      setUser(userData);
      setDevice(selectedDevice);
      setLoading(false);
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
    const response = await Api.call(
        device,
        path,
        request_type,
        localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      setError('');
      if (props.component === 'setup') {
        props.changeForm();
        navigate('/setting');
        window.location.reload(false);
      } else {
        navigate('/setting');
        window.location.reload(false);
      }
    } else {
      let modal = document.getElementById('exampleModal');
      modal.classList.remove('show');
      let modalBack = document.getElementsByClassName('modal-backdrop');
      if (modalBack) {
        for (let i = 0; i < modalBack.length; i++) {
          modalBack[i]?.classList.remove('show');
        }
      }
      setError(
          response.data ? response.data.message : 'Error, Please try again!'
      );
    }
  };

  return (
      <div className={styles.editCard}>
        {error && (
            <div className={styles.alertDanger} role="alert">
              {error}
            </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h4>デバイスデータ</h4>
          </div>

          {!loading && (
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="userId" className={styles.formLabel}>
                    userID
                  </label>
                  <div className={styles.formInput}>
                    <input
                        className={styles.formControl}
                        id="userId"
                        value={device?.userId || ''}
                        onChange={(event) =>
                            handleChange(event.target.value, 'userId')
                        }
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Sim Number
                  </label>
                  <div className={styles.formInput}>
                    <input
                        className={styles.formControl}
                        id="name"
                        value={device?.name || ''}
                        onChange={(event) => handleChange(event.target.value, 'name')}
                    />
                  </div>
                </div>

                {id && (
                    <div className={styles.formGroup}>
                      <label htmlFor="imsi" className={styles.formLabel}>
                        imsi
                      </label>
                      <div className={styles.formInput}>
                        <input
                            className={`${styles.formControl} ${styles.disabledInput}`}
                            id="imsi"
                            disabled
                            value={device?.imsi || ''}
                            onChange={(event) =>
                                handleChange(event.target.value, 'imsi')
                            }
                        />
                      </div>
                    </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="type" className={styles.formLabel}>
                    deviceType
                  </label>
                  <div className={styles.formInput}>
                    <select
                        className={`${styles.formSelect} ${styles.disabledInput}`}
                        id="type"
                        onChange={(event) => handleChange(event.target.value, 'type')}
                        value={device?.type || 'SKGM01'}
                        disabled
                    >
                      <option value="SKB001">SKB001</option>
                      <option value="SKG001">SKG001</option>
                      <option value="SKGM01">SKGM01</option>
                      <option value="SKGTL01">SKGTL01</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bikeId" className={styles.formLabel}>
                    bikeID
                  </label>
                  <div className={styles.formInput}>
                    <select
                        className={styles.formSelect}
                        id="bikeId"
                        onChange={(event) =>
                            handleChange(parseInt(event.target.value), 'bikeId')
                        }
                        value={device?.bikeId || ''}
                    >
                      {user?.bikes?.map((bike) => (
                          <option key={Utils.unique()} value={bike.id}>
                            {bike.name}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stopFLG" className={styles.formLabel}>
                    stopFLG
                  </label>
                  <div className={styles.formInput}>
                    <select
                        className={`${styles.formSelect} ${styles.disabledInput}`}
                        id="stopFLG"
                        value={device?.stopFLG || '0'}
                        disabled
                    >
                      <option value="0">有効</option>
                      <option value="9">停止</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  {props.component !== 'setup' && (
                      <button
                          type="button"
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() =>
                              navigate(
                                  `${type === 'info' ? '/setting/user-info' : '/setting'}`
                              )
                          }
                      >
                        戻る
                      </button>
                  )}

                  <div className={styles.actionButtons}>
                    {id && (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                            onClick={() => setShow(true)}
                        >
                          削除
                        </button>
                    )}

                    {component !== 'setup' ? (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            onClick={() => updateDevice()}
                        >
                          更新
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                            onClick={() => updateDevice()}
                        >
                          更新
                        </button>
                    )}
                  </div>
                </div>
              </form>
          )}
        </div>

        {/* Modal */}
        <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  確認
                </h1>
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>更新を実施します</p>
              </div>
              <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    data-bs-dismiss="modal"
                >
                  戻る
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateDevice()}
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>

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