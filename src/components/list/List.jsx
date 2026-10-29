import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ModalComponent from '../common/ModalComponent';
import Api from '../../api/Api';
import { Button } from '../common/Button.jsx';
import PageLoader from '../common/PageLoader.jsx';
import ErrorState from '../common/ErrorState.jsx';
import { getApiErrorMessage } from '../../utils/apiError.js';

function List() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [poolList, setpoolList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedFirstLevel, setSelectedFirstLevel] = useState('');
  const [selectedSecondLevel, setSelectedSecondLevel] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  let userId = localStorage.getItem('userId');
  let role = localStorage.getItem('role');
  const getList = async () => {
    setLoading(true);
    setLoadError(null);
    setList([]);
    try {
      let path = role === 'admin2' ? 'users/list' : 'users/tree';
      const response = await Api.call({}, path, 'get', userId);
      if (response.data?.code !== 200) {
        setLoadError(getApiErrorMessage(response, 'ユーザー一覧の取得に失敗しました。'));
        return;
      }

      let list = response.data.data;

      setList(list);
      setSelectedFirstLevel(list[0]);
      setSelectedSecondLevel('');
      if (role === 'master') {
        const response = await Api.call({}, 'users/list', 'get', userId);
        if (response.data?.code === 200) {
          setUsersList(response.data.data);
        }
        const poolresponse = await Api.call({}, 'users/pool', 'get', userId);
        if (poolresponse.data?.code === 200) {
          setpoolList(poolresponse.data.data);
        }
      } else if (role === 'admin1' || role === 'admin2') {
        const response = await Api.call({}, 'users/pool', 'get', userId);
        if (response.data?.code === 200) {
          setpoolList(response.data.data);
        }
        const responseUsers = await Api.call({}, 'users/list', 'get', userId);
        if (responseUsers.data?.code === 200) {
          setUsersList(responseUsers.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching user list:', err);
      setLoadError('ユーザー一覧の取得に失敗しました。通信状態を確認してください。');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (role !== 'user') {
      getList();
    }
  }, []);

  const treeButtonClass = (active) =>
    `block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
      active
        ? 'border-primary bg-primary text-primary-fg'
        : 'border-border text-text hover:bg-surface-hover'
    }`;

  const renderUserTree = () => {
    if (role === 'master' && !selectedSecondLevel) {
      const firstLevel = [];
      const secondtLevel = [];
      let secondLevelTable = false;
      let secondList = [];
      list.map((item) => {
        firstLevel.push(
          <button
            className={treeButtonClass(item.id === selectedFirstLevel.id)}
            id={item.id}
            key={item.id}
            onClick={() => setSelectedFirstLevel(item)}
          >{`${item.name2} ${item.name1}`}</button>
        );
        if (item.id === selectedFirstLevel.id) {
          secondList = usersList.filter((user) => user.parent?.id === item.id);
          if (item.admins2.length === 0) {
            secondLevelTable = true;
          } else {
            item.admins2?.map((secondItem) => {
              secondtLevel.push(
                <button
                  key={secondItem.id}
                  className={treeButtonClass(false)}
                  onClick={() => setSecondLevel(secondItem)}
                >{`${secondItem.name2} ${secondItem.name1}`}</button>
              );
            });
            if (secondList.length > 1) {
              secondtLevel.push(
                <button
                  key="direct-children"
                  className={treeButtonClass(false)}
                  onClick={() => setSecondLevel(item, secondList)}
                >{`Show Direct Children`}</button>
              );
            }
          }
        }
      });
      return (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[13rem_1fr]">
            <div className="flex flex-col gap-2">{firstLevel}</div>
            <div className="flex flex-col gap-2">
              {secondLevelTable
                ? secondList.length !== 0 && renderTable(secondList)
                : secondtLevel}
            </div>
          </div>

          <div className="mt-4">
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => setShowPool(!showPool)}>
              {showPool ? 'Hide Users Pool' : 'Show Users Pool'}
            </button>
          </div>
          {showPool && renderTable(poolList)}

          <div className="mt-4">
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide All Users' : 'Show All Users'}
            </button>
          </div>
          {showAll && renderTable(usersList)}
        </>
      );
    } else if (role === 'admin1' && !selectedSecondLevel) {
      const firstLevel = [];
      let secondtLevel = [];
      list.map((item) => {
        firstLevel.push(
          <button
            key={item.id}
            className={treeButtonClass(item.id === selectedFirstLevel.id)}
            onClick={() => setSelectedFirstLevel(item)}
          >{`${item.name2} ${item.name1}`}</button>
        );
        if (item.id === selectedFirstLevel.id) {
          let extraUsers = usersList.filter(
            (user) => user.parent?.id === item.id
          );
          secondtLevel = extraUsers;
        }
      });
      return (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[13rem_1fr]">
            <div className="flex flex-col gap-2">{firstLevel}</div>
            <div>{renderTable(secondtLevel, true)}</div>
          </div>
          <div className="mt-4">
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide All Users' : 'Show Users Pool'}
            </button>
          </div>
          {showAll && renderTable(poolList)}
        </>
      );
    } else {
      return (
        <>
          {renderTable()}
          <div className="mt-4">
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide All Users' : 'Show Users Pool'}
            </button>
          </div>
          {showAll && renderTable(poolList)}
        </>
      );
    }
  };

  const setSecondLevel = async (item, list = []) => {
    if (list.length > 0) {
      setList(list);
      setSelectedSecondLevel(item);
    } else {
      setLoading(true);
      try {
        let path = `users/list`;
        const response = await Api.call({}, path, 'get', item.id);
        if (response.data?.code === 200) {
          setList(response.data.data);
          setSelectedSecondLevel(item);
        } else {
          toast.error(getApiErrorMessage(response, 'ユーザー一覧の取得に失敗しました。'));
        }
      } catch (err) {
        console.error('Error fetching child users:', err);
        toast.error('ユーザー一覧の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    }
  };

  const userUpdate = (user) => {
    localStorage.setItem('userProfileId', user.id);
    localStorage.setItem('userProfileRole', user.role);
    navigate('/setting/user-info');
  };

  const showModal = (user) => {
    setSelectedUser(user);
    setShow(true);
  };

  const renderTable = (userList = [], showExtra = false) => {
    const listToRender = userList.length === 0 ? list : userList;
    return (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface-hover text-xs font-semibold uppercase tracking-wide text-text-muted">
              <th className="whitespace-nowrap px-3 py-2.5">筐体番号</th>
              <th className="whitespace-nowrap px-3 py-2.5">姓</th>
              <th className="whitespace-nowrap px-3 py-2.5">名</th>
              <th className="whitespace-nowrap px-3 py-2.5">ニックネーム</th>
              <th className="whitespace-nowrap px-3 py-2.5">Email</th>
              <th className="whitespace-nowrap px-3 py-2.5">属性</th>
              <th className="whitespace-nowrap px-3 py-2.5">状態</th>
              {showExtra && <th className="whitespace-nowrap px-3 py-2.5">Show</th>}
              <th className="whitespace-nowrap px-3 py-2.5">F</th>
            </tr>
          </thead>
          {!loading && (
            <tbody className="divide-y divide-border">
              {listToRender.map((user) => (
                <tr key={user.id} className="text-text hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-3 py-2.5">{user.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{user.name1}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{user.name2}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{user.nickname}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{user.email}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{user.role}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">有効</td>
                  {showExtra && (
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {user.role !== 'user' && (
                        <Button variant="secondary" size="sm" onClick={() => setSecondLevel(user)}>
                          Show children
                        </Button>
                      )}
                    </td>
                  )}
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => userUpdate(user)}>編集</Button>
                      <Button variant="danger" size="sm" onClick={() => showModal(user)}>削除</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    );
  };

  return (
    <div className="mx-auto my-8 max-w-6xl px-4">
      <div className="mb-4 flex justify-end gap-2">
        {selectedSecondLevel && (
          <Button variant="outline" onClick={() => getList()}>
            Clear Filter
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/setting')}>
          戻る
        </Button>
      </div>

      {loading && <PageLoader label="ユーザー一覧を読み込み中..." className="py-16" />}
      {!loading && loadError && <ErrorState message={loadError} onRetry={getList} />}
      {!loading && !loadError && renderUserTree()}

      {show && (
        <ModalComponent
          name={'users'}
          id={selectedUser?.id}
          close={() => setShow(false)}
          userId={localStorage.getItem('userId')}
        />
      )}
    </div>
  );
}

export default List;
