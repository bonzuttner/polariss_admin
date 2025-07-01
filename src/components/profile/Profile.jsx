import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate } from 'react-router-dom';
const Profile = (props) => {
  const component = props.component;
  const location = useLocation();
  const navigate = useNavigate();
  const type = location?.state;
  const [error, setError] = useState('');
  const [user, setUser] = useState({});

  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    const responseUser = await Api.call({}, `users/${userId}`, 'get', userId);

    if (responseUser.data) {
      let userData = responseUser.data.data;
      setUser(userData);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleChange = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const updateUser = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    const response = await Api.call(
      user,
      `users/${userId}`,
      'put',
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      setError('');
      if (type === 'info') {
        navigate('/setting/user-info');
        window.location.reload(false);
      } else {
        if (component === 'setup') {
          props.changeForm();
        } else window.location.reload(false);
      }
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
          <h4>ユーザーデータ</h4>
        </div>
        <form className="p-4">
          <div className="mb-3 row">
            <label for="name1" className="col-sm-4 col-form-label">
              苗字
            </label>
            <div className="col-sm-8">
              <input
                className="form-control"
                id="name1"
                value={user?.name1}
                onChange={(event) => handleChange(event.target.value, 'name1')}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label for="name2" className="col-sm-4 col-form-label">
              名前
            </label>
            <div className="col-sm-8">
              <input
                className="form-control"
                id="name2"
                value={user?.name2}
                onChange={(event) => handleChange(event.target.value, 'name2')}
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label for="nickname" className="col-sm-4 col-form-label">
              ニックネーム
            </label>
            <div className="col-sm-8">
              <input
                className="form-control"
                id="nickname"
                value={user?.nickname}
                onChange={(event) =>
                  handleChange(event.target.value, 'nickname')
                }
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label for="email" className="col-sm-4 col-form-label">
              E-Mail
            </label>
            <div className="col-sm-8">
              <input
                className="form-control"
                id="email"
                value={user?.email}
                onChange={(event) => handleChange(event.target.value, 'email')}
              />
            </div>
          </div>
          <div
            className={`d-flex ${
              component !== 'setup'
                ? 'justify-content-between'
                : 'justify-content-end'
            }`}
          >
            {component !== 'setup' && (
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
                onClick={() => updateUser()}
              >
                更新
              </button>
            )}
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
                ユーザーデータ
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
                onClick={() => updateUser()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
