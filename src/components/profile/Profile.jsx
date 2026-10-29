import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import Card from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import Dialog from '../common/Dialog.jsx';
import FormRow from '../common/FormRow.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import { inputClass } from '../../styles/formClasses.js';
import { getApiErrorMessage } from '../../utils/apiError.js';

const Profile = (props) => {
  const component = props.component;
  const location = useLocation();
  const navigate = useNavigate();
  const type = location?.state;
  const [error, setError] = useState('');
  const [user, setUser] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId');
    try {
      setLoading(true);
      setLoadError(null);
      const responseUser = await Api.call({}, `users/${userId}`, 'get', userId);

      if (responseUser.data?.code === 200) {
        setUser(responseUser.data.data);
      } else {
        setLoadError(getApiErrorMessage(responseUser, 'ユーザー情報の取得に失敗しました。'));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setLoadError('ユーザー情報の取得に失敗しました。通信状態を確認してください。');
    } finally {
      setLoading(false);
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
    setSubmitting(true);
    try {
      const response = await Api.call(
        user,
        `users/${userId}`,
        'put',
        localStorage.getItem('userId')
      );
      if (response.data?.code === 200) {
        setError('');
        setShowConfirm(false);
        if (type === 'info') {
          navigate('/setting/user-info');
          window.location.reload(false);
        } else {
          if (component === 'setup') {
            props.changeForm();
          } else window.location.reload(false);
        }
      } else {
        setShowConfirm(false);
        const message = getApiErrorMessage(response, 'ユーザー情報の更新に失敗しました。');
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setShowConfirm(false);
      setError('ユーザー情報の更新に失敗しました。');
      toast.error('ユーザー情報の更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label="ユーザー情報を読み込み中..." className="py-24" />;
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
          <h4 className="text-lg font-semibold text-text">ユーザーデータ</h4>
        </Card.Header>

        <Card.Body className="flex flex-col gap-4">
          <FormRow label="苗字" htmlFor="name1">
            <input
              className={inputClass}
              id="name1"
              value={user?.name1 || ''}
              onChange={(event) => handleChange(event.target.value, 'name1')}
            />
          </FormRow>

          <FormRow label="名前" htmlFor="name2">
            <input
              className={inputClass}
              id="name2"
              value={user?.name2 || ''}
              onChange={(event) => handleChange(event.target.value, 'name2')}
            />
          </FormRow>

          <FormRow label="ニックネーム" htmlFor="nickname">
            <input
              className={inputClass}
              id="nickname"
              value={user?.nickname || ''}
              onChange={(event) => handleChange(event.target.value, 'nickname')}
            />
          </FormRow>

          <FormRow label="E-Mail" htmlFor="email">
            <input
              className={inputClass}
              id="email"
              value={user?.email || ''}
              onChange={(event) => handleChange(event.target.value, 'email')}
            />
          </FormRow>

          <FormRow label="LINE IDまたは電話番号" htmlFor="description">
            <input
              className={inputClass}
              id="description"
              value={user?.description || ''}
              onChange={(event) => handleChange(event.target.value, 'description')}
              placeholder="電話番号を入力してください"
            />
            <p className="mt-1.5 text-xs text-text-faint">
              相互監視機能でのみ利用される情報となります。
              あなたが監視エリア内でSOS対象の車両を見つけ、写真付きレポートを送信した場合に限り、この連絡先がSOS発信者（紛失・盗難の当事者）に共有されます。車両が発見され、あなたのレポートが確認されるまでは共有されません。
            </p>
          </FormRow>

          <div className={`mt-2 flex ${component !== 'setup' ? 'justify-between' : 'justify-end'}`}>
            {component !== 'setup' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(type === 'info' ? '/setting/user-info' : '/setting')
                }
              >
                戻る
              </Button>
            )}
            <Button
              onClick={() => (component === 'setup' ? updateUser() : setShowConfirm(true))}
              loading={component === 'setup' && submitting}
            >
              更新
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm} size="sm">
        <Dialog.Header onClose={() => setShowConfirm(false)}>ユーザーデータ</Dialog.Header>
        <Dialog.Body>更新を実施します</Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
            戻る
          </Button>
          <Button onClick={updateUser} loading={submitting}>更新</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
};

export default Profile;
