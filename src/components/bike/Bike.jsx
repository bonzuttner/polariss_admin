import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
function Bike(props) {
  const component = props.component;
  const location = useLocation();
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;
  const [bike, setBike] = useState({});
  const [user, setUser] = useState({});
  const [show, setShow] = useState(false);

  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    const responseUser = await Api.call({}, `users/${userId}`, 'get', userId);
    if (responseUser.data) {
      let userData = responseUser.data.data;
      let selectedBike = id
        ? userData.bikes.find((a) => a.id == id)
        : userData.bikes[0];
      setUser(userData);
      setBike(selectedBike);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleChange = (value, field) => {
    setBike({ ...bike, [field]: value });
  };

  const updateBike = async () => {
    let path = id ? `bikes/${id}` : `bikes`;
    let request_type = id ? `put` : `post`;
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    bike.userId = userId;
    bike.type = 1;
    bike.sortNo = 1;
    const response = await Api.call(
      bike,
      path,
      request_type,
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      setError('');
      if (type === 'info') {
        navigate('/setting/user-info');
        window.location.reload(false);
      } else {
        if (props.component === 'setup') {
          props.changeForm();
        } else {
          navigate('/setting');
          window.location.reload(false);
        }
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
          <h4>バイクデータ</h4>
        </div>
        <form className="p-4">
          <div className="mb-3 row">
            <label for="name" className="col-sm-4 col-form-label">
              バイク名
            </label>
            <div className="col-sm-8">
              <input
                className="form-control"
                id="name"
                value={bike?.name}
                onChange={(event) => handleChange(event.target.value, 'name')}
              />
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
                  onClick={() => updateBike()}
                >
                  更新
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <div
        className="modal fade"
        id="exampleModal"
        tabindex="-1"
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
                onClick={() => updateBike()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && (
        <ModalComponent
          name={'bikes'}
          id={id}
          close={() => setShow(false)}
          userId={localStorage.getItem('userId')}
        />
      )}
    </div>
  );
}

export default Bike;
