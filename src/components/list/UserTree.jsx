import styles from './List.module.css';
import { useCallback, useState, useEffect } from "react";
import Api from '../../api/Api';

function UserTree({
                      role,
                      selectedSecondLevel,
                      list,
                      setSelectedFirstLevel,
                      setSecondLevel,
                      userUpdate,
                      showModal,
                      selectedFirstLevel
                  }) {
    const [usersList, setUsersList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    const currentUserId = localStorage.getItem('userId');




    // Fetch users with pagination
    const fetchUsers = useCallback(async (page = 1, pageSize = 5) => {
        setLoading(true);
        try {
            const response = await Api.call(
                {},
                `users/profiles/list?page=${page}&page_size=${pageSize}`,
                'get',
                localStorage.getItem('userId')
            );

            if (response.data && response.data.code === 200) {
                const { users_profiles, pagination } = response.data.data;

                const transformedUsers = users_profiles.map(user => ({
                    id: user.user_id,
                    device_id: user.device_id,
                    name1: user.last_name,
                    name2: user.first_name,
                    nickname: user.nickname,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    parent: null
                }));
                //filter out the records for the same logged user
                setUsersList(transformedUsers.filter(user => user.id !== currentUserId));
                setTotalUsers(pagination.total);
                setTotalPages(pagination.total_pages);
                setCurrentPage(pagination.page);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);



    // Fetch users when component mounts or page changes
    useEffect(() => {
        if (role === 'master' || role === 'admin1' || role === 'admin2') {
            fetchUsers(currentPage, itemsPerPage);
            console.log(fetchUsers);
        }
    }, [currentPage, itemsPerPage, role, fetchUsers]);

    // Pagination function
    const paginateUsers = useCallback((pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }, [totalPages]);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, currentPage - halfVisible);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const renderTable = useCallback((userList = [], showExtra = false) => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>データを読み込み中...</p>
                </div>
            );
        }

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

                            {/* Page numbers */}
                            {getPageNumbers().map((pageNumber, index) => (
                                <button
                                    key={index}
                                    className={`${styles.btn} ${styles.btnSm} ${
                                        pageNumber === currentPage
                                            ? styles.btnPrimary
                                            : pageNumber === '...'
                                                ? styles.btnOutline
                                                : styles.btnOutline
                                    }`}
                                    onClick={() => pageNumber !== '...' && paginateUsers(pageNumber)}
                                    disabled={pageNumber === '...'}
                                    style={{
                                        cursor: pageNumber === '...' ? 'default' : 'pointer',
                                        minWidth: pageNumber === '...' ? '20px' : '40px'
                                    }}
                                >
                                    {pageNumber}
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

                    {userList.length === 0 && !loading && (
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
    }, [setSecondLevel, userUpdate, showModal, currentPage, totalPages, totalUsers, itemsPerPage, paginateUsers, loading]);

    const renderUserTree = () => {
        if (role === 'master' && !selectedSecondLevel) {
            const firstLevel = [];
            const secondtLevel = [];
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
                        // secondLevelTable = true;
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

            return renderTable(usersList);
        }
        else if (role === 'admin1' && !selectedSecondLevel) {
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
                    let extraUsers = usersList;
                    secondtLevel = extraUsers;
                }
            });

            return renderTable(secondtLevel, true);
        }
        else {
            return renderTable(usersList);
        }
    };

    return renderUserTree();
}

export default UserTree;