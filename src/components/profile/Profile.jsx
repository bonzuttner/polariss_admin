import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css'; // Create this CSS module

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
      <div className={styles.editCard}>
        {error && (
            <div className={styles.alertDanger} role="alert">
              {error}
            </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h4>ユーザーデータ</h4>
          </div>

          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name1" className={styles.formLabel}>
                苗字
              </label>
              <div className={styles.formInput}>
                <input
                    className={styles.formControl}
                    id="name1"
                    value={user?.name1 || ''}
                    onChange={(event) => handleChange(event.target.value, 'name1')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name2" className={styles.formLabel}>
                名前
              </label>
              <div className={styles.formInput}>
                <input
                    className={styles.formControl}
                    id="name2"
                    value={user?.name2 || ''}
                    onChange={(event) => handleChange(event.target.value, 'name2')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nickname" className={styles.formLabel}>
                ニックネーム
              </label>
              <div className={styles.formInput}>
                <input
                    className={styles.formControl}
                    id="nickname"
                    value={user?.nickname || ''}
                    onChange={(event) =>
                        handleChange(event.target.value, 'nickname')
                    }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                E-Mail
              </label>
              <div className={styles.formInput}>
                <input
                    className={styles.formControl}
                    id="email"
                    value={user?.email || ''}
                    onChange={(event) => handleChange(event.target.value, 'email')}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              {component !== 'setup' && (
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

              {component !== 'setup' ? (
                  <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      onClick={() => updateUser()}
                  >
                    更新
                  </button>
              ) : (
                  <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => updateUser()}
                  >
                    更新
                  </button>
              )}
            </div>
          </form>
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
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
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