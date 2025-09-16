//UserTree.jsx
import styles from './List.module.css';
import {useCallback, useState} from "react";

function UserTree({
                      role,
                      selectedSecondLevel,
                      list,
                      usersList,
                      poolList,
                      showAll,
                      showPool,
                      setSelectedFirstLevel,
                      setSecondLevel,
                      setShowAll,
                      setShowPool,
                      userUpdate,
                      showModal,
                      selectedFirstLevel,
                      currentPage,
                      totalPages,
                      totalUsers,
                      itemsPerPage,
                      paginateUsers
}) {
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);

    const renderTable = useCallback((userList = [], showExtra = false, type = '') => {
        return (
            <>
                <br />
                <h2 className={styles.h2}>管理者情報</h2>
                <div className={`${styles.tableContainer} ${styles.tableReveal}`}>
                    <table className={styles.modernTable}>
                        <thead>
                        <tr>
                            <th scope="col">ユーザーID</th>
                            <th scope="col">デバイスID</th>
                            <th scope="col">姓</th>
                            <th scope="col">名</th>
                            <th scope="col">ニックネーム</th>
                            <th scope="col">Email</th>
                            <th scope="col">属性</th>
                            <th scope="col">状態</th>
                            {showExtra && <th scope="col">操作</th>}
                            <th scope="col">操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userList.map((user, index) => {
                            const rowStyle = {
                                animationDelay: `${index * 0.05}s`,
                                opacity: 0
                            };

                            return (
                                <tr
                                    key={user.device_id || index}
                                    className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${styles.tableRowAnimated}`}
                                    style={rowStyle}
                                >
                                    <td>{user.id}</td>
                                    <td>{user.device_id || 'ー'}</td>
                                    <td>{user.name1}</td>
                                    <td>{user.name2}</td>
                                    <td>{user.nickname}</td>
                                    <td>{user.email}</td>
                                    <td>
                      <span className={`${styles.roleBadge} ${
                          user.role === 'admin' ? styles.roleAdmin :
                              user.role === 'manager' ? styles.roleManager :
                                  styles.roleUser
                      }`}>
                        {user.role}
                      </span>
                                    </td>
                                    <td>
                      <span className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                        {user.status === 'active' ? '有効' : '無効'}
                      </span>
                                    </td>
                                    {showExtra && (
                                        <td>
                                            {user.role !== 'user' && (
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnOutline}`}
                                                    onClick={() => setSecondLevel(user)}
                                                >
                                                    下位を表示
                                                </button>
                                            )}
                                        </td>
                                    )}
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                                                onClick={() => userUpdate(user)}
                                            >
                                                編集
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                onClick={() => showModal(user)}
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {userList.length > 0 && totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => paginateUsers(1)}
                                disabled={currentPage === 1}
                            >
                                ≪
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => paginateUsers(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                前へ
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    className={`${styles.btn} ${styles.btnSm} ${
                                        currentPage === number ? styles.btnPrimary : styles.btnOutline
                                    }`}
                                    onClick={() => paginateUsers(number)}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => paginateUsers(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                次へ
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => paginateUsers(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                ≫
                            </button>
                        </div>
                    )}

                    {/* Pagination Info */}
                    {userList.length > 0 && (
                        <div className={styles.paginationInfo}>
              <span>
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalUsers)} / {totalUsers}件を表示
                (ページ {currentPage} / {totalPages})
              </span>
                        </div>
                    )}

                    {userList.length === 0 && (
                        <div className={styles.emptyState}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.emptyStateIcon}>
                                <path d="M3 6H21M3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6M3 6L5 3H19L21 6M10 10H14M10 14H14M10 18H14"
                                      stroke="#4611a7" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3>データがありません</h3>
                            <p>表示するユーザーが見つかりませんでした</p>
                        </div>
                    )}
                </div>
            </>
        );
    }, [setSecondLevel, userUpdate, showModal, currentPage, totalPages, totalUsers, itemsPerPage, paginateUsers]);
    const renderUserTree = () => {
        if (role === 'master' && !selectedSecondLevel) {
            const firstLevel = [];
            const secondtLevel = [];
            let secondLevelTable = false;
            let secondList = [];

            list.map((item) => {
                firstLevel.push(
                    <button
                        className={` ${styles.btn} ${styles.btnMd} ${item.id === selectedFirstLevel.id
                            ? styles.btnPrimary
                            : styles.btnOutline
                            }`}
                        id={item.id}
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
                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnMd}  ${styles.btnOutline}`}
                                    onClick={() => setSecondLevel(secondItem)}
                                >{`${secondItem.name2} ${secondItem.name1}`}</button>
                            );
                        });

                        if (secondList.length > 1) {
                            secondtLevel.push(
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnMd} ${styles.btnOutline}`}
                                    onClick={() => setSecondLevel(item, secondList)}
                                >{`Show Direct Children`}</button>
                            );
                        }
                    }
                }
            });

            return (
                <>


                    {/*{showPool && renderTable(poolList)}*/}
                    { renderTable(usersList.filter(user =>
                        !poolList.some(poolUser => poolUser.id === user.id)
                    ))}
                </>
            );
        } else if (role === 'admin1' && !selectedSecondLevel) {
            const firstLevel = [];
            let secondtLevel = [];

            list.map((item) => {
                firstLevel.push(
                    <button
                        className={`btn d-block ${item.id === selectedFirstLevel.id
                            ? 'btn-secondary'
                            : 'btn-outline-secondary'
                            }`}
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
                    <div className="d-flex ">
                        <div className="second level">
                            <div className=""> {firstLevel}</div>
                            {' '}
                            {renderTable(secondtLevel, true)}
                        </div>
                    </div>
                    <div className="show-all-section">
                        <button
                            className={`${styles.btn} ${styles.btnMd} mt-2 ${styles.btnPrimary
                                }`}
                            onClick={() => setShowAll(!showAll)}
                        >{`${showAll ? 'Hide All Users' : 'Show Users Pool'}`}</button>
                    </div>
                    {showAll && renderTable(poolList)}
                </>
            );
        } else {
            return (
                <>
                    {renderTable()}
                    <div className="show-all-section">
                        <button
                            className={`${styles.btn} ${styles.btnMd} mt-2 ${styles.btnPrimary
                                }`}
                            onClick={() => setShowAll(!showAll)}
                        >{`${showAll ? 'Hide All Users' : 'Show Users Pool'}`}</button>
                    </div>
                    {showAll && renderTable(poolList)}
                </>
            );
        }
    };

    return renderUserTree();
}

export default UserTree;