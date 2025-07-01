import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import Utils from "../utils/utils.js";
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
    // id ? `devices/${id}` : `devices`
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
    <div className="edit-card">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header p-3">
          <h4>デバイスデータ</h4>
        </div>
        {!loading && (
          <form className="p-4">
            <div className="mb-3 row">
              <label for="userId" className="col-sm-4 col-form-label">
                userID
              </label>
              <div className="col-sm-8">
                <input
                  className="form-control"
                  id="userId"
                  value={device?.userId}
                  onChange={(event) =>
                    handleChange(event.target.value, 'userId')
                  }
                />
              </div>
            </div>
            <div className="mb-3 row">
              <label for="name" className="col-sm-4 col-form-label">
                Sim Number
              </label>
              <div className="col-sm-8">
                <input
                  className="form-control"
                  id="name"
                  value={device?.name}
                  onChange={(event) => handleChange(event.target.value, 'name')}
                />
              </div>
            </div>
            {id && (
              <div className="mb-3 row">
                <label for="sortNo" className="col-sm-4 col-form-label">
                  imsi
                </label>
                <div className="col-sm-8">
                  <input
                    className="form-control"
                    id="imsi"
                    disabled
                    value={device?.imsi}
                    onChange={(event) =>
                      handleChange(event.target.value, 'imsi')
                    }
                  />
                </div>
              </div>
            )}

            <div className="mb-3 row">
              <label for="type" className="col-sm-4 col-form-label">
                deviceType
              </label>
              <div className="col-sm-8">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  id="type"
                  onChange={(event) => handleChange(event.target.value, 'type')}
                  value={device?.type}
                  disabled
                >
                  <option key={Utils.unique()} value="SKB001"> SKB001 </option>
                  <option key={Utils.unique()} value="SKG001"> SKG001 </option>
                  <option key={Utils.unique()}  value="SKGM01" selected>
                    SKGM01
                  </option>
                  <option  key={Utils.unique()} value="SKGTL01"> SKGTL01 </option>
                </select>
              </div>
            </div>

            <div className="mb-3 row">
              <label for="bikeId" className="col-sm-4 col-form-label">
                bikeID
              </label>
              <div className="col-sm-8">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  id="bikeId"
                  onChange={(event) =>
                    handleChange(parseInt(event.target.value), 'bikeId')
                  }
                  value={device?.bikeId}
                >
                  {user?.bikes.map((bike) => {
                    return <option key={Utils.unique()} value={bike.id}>{bike.name}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="mb-3 row">
              <label for="stopFLG" className="col-sm-4 col-form-label">
                stopFLG
              </label>
              <div className="col-sm-8">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  id="stopFLG"
                  value={device?.stopFLG}
                  disabled
                >
                  <option key={Utils.unique()} value="0" selected="">
                    有効
                  </option>
                  <option key={Utils.unique()} value="9"> 停止 </option>
                </select>
              </div>
            </div>

            <div
              className={`d-flex ${
                props.component !== 'setup'
                  ? 'justify-content-between'
                  : 'justify-content-end'
              }`}
            >
              {props.component !== 'setup' && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() =>
                    navigate(
                      `${type === 'info' ? '/setting/user-info' : '/setting'}`
                    )
                  }
                >
                  戻る
                </button>
              )}
              <div className="d-flex justify-content-between">
                {id && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mx-3 px-2"
                    onClick={() => setShow(true)}
                  >
                    削除
                  </button>
                )}

                {component !== 'setup' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    更新
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
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
