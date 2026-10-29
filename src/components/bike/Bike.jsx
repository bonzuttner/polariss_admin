import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import ModalComponent from '../common/ModalComponent';
import Card from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import FormRow from '../common/FormRow.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import { inputClass } from '../../styles/formClasses.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FaCamera } from 'react-icons/fa';

function Bike(props) {
  const { component } = props;
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const type = location?.state;

  const [bike, setBike] = useState({});
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [pageLoading, setPageLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const getBikeDetails = async () => {
    if (!id) return;
    try {
      setPageLoading(true);
      setLoadError(null);
      const authHeader = localStorage.getItem('userId');
      const response = await Api.call({}, `bikes/${id}`, 'get', authHeader);
      if (response?.data?.code === 200) {
        const bikeData = response.data.data;
        setBike(bikeData);
        setImageUrl(bikeData.image || '');
      } else {
        setLoadError(getApiErrorMessage(response, 'バイク情報の取得に失敗しました。'));
      }
    } catch (err) {
      console.error('Error fetching bike:', err);
      setLoadError('バイク情報の取得に失敗しました。通信状態を確認してください。');
    } finally {
      setPageLoading(false);
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

  const updateBike = async () => {
    setSubmitting(true);

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

    if (bike.image && typeof bike.image !== "string") {
      payload.append('image', bike.image);
    }

    try {
      const response = await Api.callFormData(payload, path, request_type, authId);

      if (response.data?.code === 200) {
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
        const message = getApiErrorMessage(response, 'バイク情報の保存に失敗しました。');
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Error saving bike:', err);
      setError('バイク情報の保存に失敗しました。');
      toast.error('バイク情報の保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <PageLoader label="バイク情報を読み込み中..." className="py-24" />;
  }

  if (loadError) {
    return (
      <div className="mx-auto my-10 w-full max-w-xl px-4">
        <ErrorState message={loadError} onRetry={getBikeDetails} />
      </div>
    );
  }

  return (
      <div className="mx-auto my-10 w-full max-w-xl px-4">
        <ErrorBanner>{error}</ErrorBanner>

        <Card>
          <Card.Header>
            <h4 className="text-lg font-semibold text-text">バイクデータ</h4>
          </Card.Header>

          <Card.Body className="flex flex-col gap-4">
            <FormRow label="バイク名" htmlFor="name">
              <input
                  className={inputClass}
                  id="name"
                  value={bike?.name || ''}
                  onChange={(event) => handleChange(event.target.value, 'name')}
              />
            </FormRow>

            <FormRow label="説明" htmlFor="description">
              <input
                  className={inputClass}
                  id="description"
                  value={bike?.description || ''}
                  onChange={(event) => handleChange(event.target.value, 'description')}
              />
            </FormRow>

            <FormRow label="画像">
              <div
                  className="group relative h-36 w-36 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-bg transition hover:border-primary"
                  onClick={() => document.getElementById('imageInput').click()}
              >
                {imageUrl ? (
                    <>
                      <img
                          src={imageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 transition group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-900">
                          <FaCamera size={12} />
                          置き換える
                        </span>
                      </div>
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-faint">
                      <FaCamera size={20} />
                      <span className="text-center text-xs">クリックしてアップロード</span>
                    </div>
                )}
              </div>

              <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="hidden"
              />
            </FormRow>

            <div className={`mt-2 flex ${component !== 'setup' ? 'justify-between' : 'justify-end'}`}>
              {component !== 'setup' && (
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

                <Button onClick={updateBike} loading={submitting}>
                  {submitting ? '保存中...' : '更新'}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

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
