import React, {useEffect, useRef} from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Api from '../../api/Api';
import { useNavigate, useParams } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import styles from './Bike.module.css'; // Create this CSS module

function Bike(props) {
  const component = props.component;
  const location = useLocation();
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;
  const [bike, setBike] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");




  const getBikeData = async () => {
    if (!id) return;

    const authHeader = localStorage.getItem('userId');

    try {
      const response = await Api.call({}, `bikes/${id}`, 'get', authHeader);

      if (response?.data?.code === 200) {
        setBike(response.data.data);
      } else {
        setError(response?.data?.message || 'Failed to fetch bike details');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching bike details');
    }
  };

  useEffect(() => {
    if (id){
      setIsImageLoading(true);
      getBikeData();
      setIsImageLoading(false);

    }

  }, [id]);





  const handleChange = (value, field) => {
    setBike({ ...bike, [field]: value });
  };

  const updateBike = async () => {
    setLoading(true); // start spinner

    const path = id ? `bikes/${id}` : `bikes`;
    const request_type = id ? `put` : `post`;
    const userId =
        type === 'info'
            ? localStorage.getItem('userProfileId')
            : localStorage.getItem('userId');

    const authId = localStorage.getItem('userId');
    const payload = new FormData();

    payload.append('userId', userId);
    payload.append('name', bike.name || '');
    payload.append('type', 1);
    payload.append('sortNo', 1);
    payload.append('description', bike.description || '');


 // if (!bike.image || imagePreview === "") {
 //      // Case 2: Image was removed
 //      payload.append('image', imagePreview);
 //    }
    // 🧠 Handle image upload/remove logic
    if (bike.image && typeof bike.image !== "string") {
      // Case 1: New image file selected
      payload.append('image', bike.image);
    }

    try {
      const response = await Api.callFormData(payload, path, request_type, authId);

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
        setError(response.data?.message || 'Error, Please try again!');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false); // stop spinner
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
            <h4>顧客名  </h4>
          </div>

          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                顧客名
              </label>
              <div className={styles.formInput}>
                <input
                    className={styles.formControl}
                    id="name"
                    value={bike?.name || ''}
                    onChange={(event) => handleChange(event.target.value, 'name')}
                />
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
                        onClick={() => updateBike()}
                        disabled={loading}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"
                                  aria-hidden="true"></span>
                            保存中...
                          </>
                      ) : (
                          '更新'
                      )}
                    </button>

                ) : (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => updateBike()}
                    >
                    更新
                    </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Modal */
        }
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