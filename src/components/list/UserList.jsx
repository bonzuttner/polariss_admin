// UserList.jsx
import { useState, useEffect, useCallback } from 'react';
import Api from '../../api/Api';
import styles from './List.module.css';

function UserList({ userUpdate, showModal }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Fetch users
    const fetchUsers = useCallback(async (page = 1, pageSize = 5) => {
        setLoading(true);
        try {
            const response = await Api.call(
                {},
                `users/profiles/users-list?page=${page}&page_size=${pageSize}`,
                'get'
            );

            if (response.data && response.data.code === 200) {
                const data = response.data.data;
                const userList = (data.users_profiles || []).map(user => ({
                    id: user.user_id,         // normalize key for consistency
                    name1: user.last_name,
                    name2: user.first_name,
                    nickname: user.nickname,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }));

                setUsers(userList);
                setTotalItems(data.pagination?.total || userList.length);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load users on mount & when page changes
    useEffect(() => {
        fetchUsers(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, fetchUsers]);

    // Generate page numbers for pagination (like CustomerList)
    const getPageNumbers = useCallback(() => {
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
                if (startPage > 2) pageNumbers.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    }, [currentPage, totalPages]);

    const pageNumbers = getPageNumbers();


    // Pagination helpers
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>ユーザー情報を読み込み中...</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <h2 className={styles.h2}>全管理者及びユーザー情報</h2>

            {users.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>ユーザーが見つかりません</h3>
                    <p>表示するユーザー情報がありません。</p>
                </div>
            ) : (
                <>
                    <table className={styles.modernTable}>
                        <thead>
                        <tr>
                            <th scope="col">ユーザーID</th>
                            <th scope="col">店舗名</th>
                            <th scope="col">店舗名（補足)</th>
                            <th scope="col">ニックネーム</th>
                            <th scope="col">Email</th>
                            <th scope="col">属性</th>
                            <th scope="col">状態</th>
                            <th scope="col">操作</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((user, index) => {
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
                                    <td>{user.name2}</td>
                                    <td>{user.name1}</td>
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

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                title="最初のページ"
                            >
                                ≪
                            </button>

                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                title="前のページ"
                            >
                                前へ
                            </button>

                            {pageNumbers.map((pageNumber, index) => (
                                <button
                                    key={`page-${index}-${pageNumber}`}
                                    className={`${styles.btn} ${styles.btnSm} ${
                                        pageNumber === currentPage
                                            ? styles.btnPrimary
                                            : pageNumber === '...'
                                                ? styles.btnOutline
                                                : styles.btnOutline
                                    }`}
                                    onClick={() => pageNumber !== '...' && goToPage(pageNumber)}
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
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                title="次のページ"
                            >
                                次へ
                            </button>

                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                title="最後のページ"
                            >
                                ≫
                            </button>
                        </div>
                    )}

                </>
            )}
        </div>
    );
}

export default UserList;
