import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Api from '../../api/Api';
import ModalComponent from '../common/ModalComponent';

function Bike(props) {
  const { component } = props;
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;

  const [bike, setBike] = useState({});
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // for local image state
  const [imageLoading, setImageLoading] = useState(false);

  // ✅ Fetch bike details from /v2/bikes/<id>
  const getBikeDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
       const authHeader = localStorage.getItem('userId');


        const response = await Api.call({}, `bikes/${id}`, 'get', authHeader);
      if (response?.data?.data) {
        const bikeData = response.data.data;
        setBike(bikeData);
        setImageUrl(bikeData.image || '');
      }
    } catch (err) {
      console.error('Error fetching bike:', err);
      setError('Failed to fetch bike details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBikeDetails();
  }, [id]);

  const handleChange = (value, field) => {
    setBike({ ...bike, [field]: value });
  };

  const handleImageChange = (file) => {
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      setBike({ ...bike, image: file });
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setBike({ ...bike, image: '' });
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
      <div className="edit-card position-relative">
        {loading && (
            <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'wait',
                }}
            >
              <div className="spinner-border text-primary" role="status"></div>
            </div>
        )}

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
            {/* 🏍️ Bike Name */}
            <div className="mb-3 row">
              <label htmlFor="name" className="col-sm-4 col-form-label">
                バイク名
              </label>
              <div className="col-sm-8">
                <input
                    className="form-control"
                    id="name"
                    value={bike?.name || ''}
                    onChange={(event) => handleChange(event.target.value, 'name')}
                />
              </div>
            </div>

            {/* 📝 Description */}
            <div className="mb-3 row">
              <label htmlFor="description" className="col-sm-4 col-form-label">
                説明
              </label>
              <div className="col-sm-8">
                <input
                    className="form-control"
                    id="description"
                    value={bike?.description || ''}
                    onChange={(event) =>
                        handleChange(event.target.value, 'description')
                    }
                />
              </div>
            </div>

            {/* 🖼️ Image Upload */}
            <div className="mb-3 row">
              <label htmlFor="image" className="col-sm-4 col-form-label">
                画像
              </label>
              <div className="col-sm-8">
                <div
                    style={{
                      position: 'relative',
                      width: '150px',
                      height: '150px',
                      border: imageUrl ? 'none' : '2px dashed #ccc',
                      borderRadius: '10px',
                      backgroundColor: imageUrl ? 'transparent' : '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                    onClick={() => document.getElementById('imageInput').click()}
                >
                  {imageLoading ? (
                      <div className="spinner-border text-primary" role="status" />
                  ) : imageUrl ? (
                      <>
                        <img
                            src={imageUrl}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '10px',
                            }}
                        />
                        <div
                            className="image-overlay"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = 1)
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = 0)
                            }
                        >
                          <button
                              className="btn btn-light btn-sm me-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('imageInput').click();
                              }}
                          >
                            置き換える
                          </button>
                          {/*<button*/}
                          {/*    className="btn btn-danger btn-sm"*/}
                          {/*    onClick={(e) => {*/}
                          {/*      e.stopPropagation();*/}
                          {/*      handleRemoveImage();*/}
                          {/*    }}*/}
                          {/*>*/}
                          {/*  削除*/}
                          {/*</button>*/}
                        </div>
                      </>
                  ) : (
                      <span style={{ color: '#999', fontSize: '14px' }}>
                    クリックしてアップロード
                  </span>
                  )}
                </div>

                <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* 🧭 Buttons */}
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
                          navigate(type === 'info' ? '/setting/user-info' : '/setting')
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

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateBike()}
                    disabled={loading}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? (
                      <>
                    <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                        保存中...
                      </>
                  ) : (
                      '更新'
                  )}
                </button>
              </div>
            </div>
          </form>
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
