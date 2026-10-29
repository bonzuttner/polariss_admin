import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../api/Api';
import Card from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import Dialog from '../common/Dialog.jsx';
import DropdownMenu from '../common/DropdownMenu.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import { inputClass, labelClass } from '../../styles/formClasses.js';
import { FaChevronDown } from 'react-icons/fa';
import { getApiErrorMessage } from '../../utils/apiError.js';

const TABS = [
  { key: 'profile', label: 'ユーザー情報' },
  { key: 'bikes', label: '車両情報' },
  { key: 'devices', label: 'デバイス情報' },
];

function DetailRow({ label, value }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="truncate text-sm font-medium text-text">{value ?? '-'}</span>
    </li>
  );
}

function Settings(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [parent, setParent] = useState('');
  const [role, setRole] = useState(localStorage.getItem('userProfileRole'));
  const [error, setError] = useState('');
  let userId = id || localStorage.getItem('userId');
  let componentType = props.type;
  let userProfileId =
    componentType === 'info' ? localStorage.getItem('userProfileId') : userId;

  let logedInRole = localStorage.getItem('role');
  const [userDetail, setUserDetail] = useState({});
  const [selectedTab, setSelectedTab] = useState('profile');
  const [showConfirm, setShowConfirm] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getDetails = async () => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const response = await Api.call(
        {},
        `users/${userProfileId}`,
        'get',
        userId
      );
      if (response.data?.code === 200) {
        let userData = response.data.data;
        const userItem = document.getElementById('user-name');

        localStorage.setItem('userId', userId);

        if (userId === userProfileId) {
          if (userData.name1) localStorage.setItem('user-name', userData.name1);
          localStorage.setItem('role', userData.role);
          if (userItem) {
            userItem.innerHTML = userData.name1;
          }
        }

        setUserDetail(userData);
        setParent(userData.parent);
      } else {
        setDetailError(getApiErrorMessage(response, 'ユーザー情報の取得に失敗しました。'));
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setDetailError('ユーザー情報の取得に失敗しました。通信状態を確認してください。');
    } finally {
      setDetailLoading(false);
    }
  };
  const getUserList = async () => {
    try {
      let path = 'users/tree';
      const response = await Api.call({}, path, 'get', userId);
      if (response.data?.code === 200) {
        let list = response.data.data;
        if (logedInRole === 'master') {
          list?.splice(0, 0, {
            admins2: [],
            email: 'Master',
            id: 'e19a238b-0a33-4b43-a440-22bb486657a2',
            name1: 'Master',
            name2: 'Master',
            nickname: 'Master',
            role: 'master',
          });
        } else if (logedInRole === 'admin2') {
          list = list[0].admins2;
        }

        setList(list);
      }
    } catch (err) {
      console.error('Error fetching user list:', err);
      toast.error('ユーザー一覧の取得に失敗しました。');
    }
  };
  useEffect(() => {
    if (id || localStorage.getItem('userId')) {
      getDetails();
    }
    if (logedInRole !== 'user' && componentType === 'info') {
      getUserList();
    }
  }, []);

  const tabClicked = (type) => {
    setSelectedTab(type);
  };

  const setParentData = (item) => {
    setParent(item);
  };

  // Flatten admin1 -> admin2 into a single list for the parent picker,
  // indenting admin2 entries under their admin1 parent.
  const parentOptions = list.flatMap((item) => {
    const options = [{ item, depth: 0 }];
    (item.admins2 || []).forEach((child) => options.push({ item: child, depth: 1 }));
    return options;
  });

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return (
          <Card>
            <Card.Header className="flex justify-end">
              <Button
                size="sm"
                onClick={() => navigate('/setting/profile', { state: componentType })}
              >
                編集
              </Button>
            </Card.Header>
            <ul className="divide-y divide-border">
              <DetailRow label="苗字" value={userDetail.name1} />
              <DetailRow label="名前" value={userDetail.name2} />
              <DetailRow label="ニックネーム" value={userDetail.nickname} />
              <DetailRow label="E-Mail" value={userDetail.email} />
              <DetailRow label="ユーザー種別" value={userDetail.role} />
              <DetailRow label="LINE IDまたは電話番号" value={userDetail.description} />
            </ul>
          </Card>
        );
      case 'bikes':
        return (
          <Card>
            <Card.Header className="flex justify-end">
              <Button
                size="sm"
                onClick={() => navigate('/setting/bike', { state: componentType })}
              >
                新規登録
              </Button>
            </Card.Header>
            <ul className="divide-y divide-border">
              {userDetail?.bikes?.map((bike) => (
                <li key={bike.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-medium text-text">{bike.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">{bike.type}</span>
                    <span className="text-sm text-text-muted">{bike.sortNo}</span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/setting/bike/${bike.id}`, { state: componentType })}
                    >
                      編集
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      case 'devices':
        return (
          <Card>
            <Card.Header className="flex justify-end">
              <Button
                size="sm"
                onClick={() => navigate('/setting/device', { state: componentType })}
              >
                新規登録
              </Button>
            </Card.Header>
            <ul className="divide-y divide-border">
              {userDetail?.devices?.map((device) => (
                <li key={device.imsi} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-medium text-text">{device.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-muted">
                      {userDetail.bikes.find((a) => a.id === device.bikeId)?.name}
                    </span>
                    <span className="text-sm text-text-muted">{device.type}</span>
                    <span className="text-sm text-text-muted">{device.sortNo}</span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/setting/device/${device.imsi}`, { state: componentType })}
                    >
                      編集
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      case 'assign-users':
        return (
          <Card>
            <Card.Body className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Role</label>
                <select
                  className={inputClass}
                  value={role || ''}
                  onChange={(event) => setRole(event.target.value)}
                >
                  {logedInRole === 'master' && <option value="admin1">Admin1</option>}
                  {(logedInRole === 'master' || logedInRole === 'admin1') && (
                    <option value="admin2">Admin2</option>
                  )}
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Parent</label>
                <DropdownMenu
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto"
                  trigger={
                    <button
                      type="button"
                      className={`${inputClass} flex items-center justify-between text-left`}
                    >
                      <span className="truncate">{parent ? parent?.nickname : 'Select parent'}</span>
                      <FaChevronDown size={11} className="shrink-0 text-text-faint" />
                    </button>
                  }
                >
                  {parentOptions.map(({ item, depth }) => (
                    <DropdownMenu.Item
                      key={item.id}
                      onSelect={() => setParentData(item)}
                      className={`${depth ? 'pl-6' : ''} ${item.id === parent?.id ? 'bg-primary/10 font-semibold text-primary' : ''}`}
                    >
                      {item.nickname}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu>
              </div>

              <div className="mt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate('/setting')}>
                  戻る
                </Button>
                <Button onClick={() => setShowConfirm(true)}>更新</Button>
              </div>
            </Card.Body>
          </Card>
        );
      default:
        return null;
    }
  };

  const updateUserRoleParent = async () => {
    let body = {
      role: role,
    };
    if (parent) {
      body.parentId = parent.id;
    }
    setSubmitting(true);
    try {
      const response = await Api.call(
        body,
        `users/${localStorage.getItem('userProfileId')}/role`,
        'put',
        localStorage.getItem('userId')
      );
      if (response?.data?.code === 200) {
        localStorage.setItem('userProfileRole', response?.data.data.role);
        window.location.reload(false);
      } else {
        setShowConfirm(false);
        const message = getApiErrorMessage(response, 'ユーザー情報の更新に失敗しました。');
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Error updating user role/parent:', err);
      setShowConfirm(false);
      setError('ユーザー情報の更新に失敗しました。');
      toast.error('ユーザー情報の更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (detailLoading) {
    return <PageLoader label="ユーザー情報を読み込み中..." className="py-24" />;
  }

  if (detailError) {
    return (
      <div className="mx-auto my-10 w-full max-w-2xl px-4">
        <ErrorState message={detailError} onRetry={getDetails} />
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 w-full max-w-2xl px-4 text-center">
      <ErrorBanner className="text-left">{error}</ErrorBanner>

      <div className="mx-auto">
        <div className="mb-4 flex justify-center gap-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => tabClicked(tab.key)}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                selectedTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {logedInRole !== 'user' && componentType === 'info' && (
            <button
              type="button"
              onClick={() => tabClicked('assign-users')}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                selectedTab === 'assign-users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              Assign Users
            </button>
          )}
        </div>
        <div className="text-left">{renderTabContent()}</div>
      </div>

      {localStorage.getItem('role') !== 'user' && (
        <Button className="mt-6" onClick={() => navigate('/setting/list')}>
          管理画面
        </Button>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm} size="sm">
        <Dialog.Header onClose={() => setShowConfirm(false)}>ユーザーデータ</Dialog.Header>
        <Dialog.Body>更新を実施します</Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
            戻る
          </Button>
          <Button onClick={updateUserRoleParent} loading={submitting}>更新</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export default Settings;
