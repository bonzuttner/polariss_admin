//SimManagement.jsx
import {useState, useEffect, useCallback} from 'react';
import styles from './List.module.css';
import Api from '../../api/Api'; // Adjust path as needed



function SimList({deviceUpdate}) {
    const [simList, setSimList] = useState([]);
    const [simLoading, setSimLoading] = useState(true);
    const [simCurrentPage, setSimCurrentPage] = useState(1);
    const [simItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    // Pagination calculations
    const [totalPages, setTotalPages] = useState(0);



    const fetchSimData = useCallback(async (page = 1, pageSize = 5) => {
        setSimLoading(true);
        try {
            const response = await Api.call({}, `devices/sim/list?page=${page}&page_size=${pageSize}`, 'get');

            if (response.data && response.data.code === 200) {
                const { sims, pagination } = response.data.data;

                // Transform API data to match your component structure
                const transformedSims = sims.map((sim, index) => ({
                    id: sim.device_imsi, // Using IMSI as ID
                    deviceName: sim.sim_number,
                    deviceImsi: sim.device_imsi,
                    status: "available", // You might need to get this from API if available
                    createdAt: new Date().toISOString().split('T')[0] // Default date
                }));

                setSimList(transformedSims);
                setTotalItems(pagination.total);
                setTotalPages(pagination.total_pages);
                setSimCurrentPage(pagination.page);
            }
        } catch (error) {
            console.error('Failed to fetch SIM data:', error);
        } finally {
            setSimLoading(false);
        }
    }, []);

    // Add this useEffect to load SIM data
     useEffect(() => {
         fetchSimData(simCurrentPage, simItemsPerPage);
     }, [simCurrentPage, simItemsPerPage, fetchSimData]);

    // Pagination functions
    const simPaginate =useCallback( (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setSimCurrentPage(pageNumber);
        }
    } ,[totalPages]);

    const simNextPage =useCallback( () => {
        if (simCurrentPage < totalPages) {
            setSimCurrentPage(simCurrentPage + 1);
        }
    },[simCurrentPage, totalPages]);

    const simPrevPage =useCallback( () => {
        if (simCurrentPage > 1) {
            setSimCurrentPage(simCurrentPage - 1);
        }
    },[simCurrentPage]);

    const simGoToFirstPage = useCallback(() => setSimCurrentPage(1), []);
    const simGoToLastPage = useCallback(() => setSimCurrentPage(totalPages), [totalPages]);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Show truncated pagination
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, simCurrentPage - halfVisible);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust if we're at the end
            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // Add first page and ellipsis if needed
            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }

            // Add visible page numbers
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis and last page if needed
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    if (simLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>SIMデータを読み込み中...</p>
            </div>
        );
    }

    const renderSimList = () => {
        if (simLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>SIMデータを読み込み中...</p>
                </div>
            );
        }

        return (
            <>
                <h2 className={styles.h2}>SIMリスト（在庫リスト）</h2>
                <div className={`${styles.tableContainer} ${styles.tableReveal}`}>
                    {simList.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.emptyStateIcon}>
                                <path d="M3 6H21M3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6M3 6L5 3H19L21 6M10 10H14M10 14H14M10 18H14"
                                    stroke="#4611a7" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3>SIMデータがありません</h3>
                            <p>表示するSIM情報が見つかりませんでした</p>
                        </div>
                    ) : (
                        <>
                            <table className={styles.modernTable}>
                                <thead>
                                <tr>
                                    <th scope="col" style={{width: '60%', textAlign: 'left'}}>
                                        SIM番号
                                    </th>
                                    <th scope="col" style={{width: '40%', textAlign: 'center'}}>
                                        操作
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {simList.map((sim, index) => {
                                    const rowStyle = {
                                        animationDelay: `${index * 0.05}s`,
                                        opacity: 0
                                    };

                                    return (
                                        <tr
                                            key={sim.deviceImsi} // Use IMSI as key
                                            className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${styles.tableRowAnimated}`}
                                            style={rowStyle}
                                        >
                                            <td style={{width: '60%', textAlign: 'left', paddingLeft: '20px'}}>
                                                {sim.deviceName}
                                            </td>
                                            <td style={{width: '40%', textAlign: 'center'}}>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                        onClick={() => deviceUpdate(sim)}
                                                    >
                                                        編集
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>

                            {/* Enhanced Pagination controls */}
                            <div className={styles.pagination}>
                                {/* First and Previous buttons */}
                                <button
                                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                    onClick={simGoToFirstPage}
                                    disabled={simCurrentPage === 1}
                                    title="最初のページ"
                                >
                                    ≪
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                    onClick={simPrevPage}
                                    disabled={simCurrentPage === 1}
                                    title="前のページ"
                                >
                                    前へ
                                </button>

                                {/* Page numbers */}
                                {getPageNumbers().map((pageNumber, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.btn} ${styles.btnSm} ${pageNumber === simCurrentPage
                                            ? styles.btnPrimary
                                            : pageNumber === '...'
                                                ? styles.btnOutline
                                                : styles.btnOutline
                                        }`}
                                        onClick={() => pageNumber !== '...' && simPaginate(pageNumber)}
                                        disabled={pageNumber === '...'}
                                        style={{
                                            cursor: pageNumber === '...' ? 'default' : 'pointer',
                                            minWidth: pageNumber === '...' ? '20px' : '40px'
                                        }}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                {/* Next and Last buttons */}
                                <button
                                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                    onClick={simNextPage}
                                    disabled={simCurrentPage === totalPages}
                                    title="次のページ"
                                >
                                    次へ
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                                    onClick={simGoToLastPage}
                                    disabled={simCurrentPage === totalPages}
                                    title="最後のページ"
                                >
                                    ≫
                                </button>
                            </div>

                            {/* Pagination info */}
                            <div className={styles.paginationInfo}>
                                {totalItems > 0 && (
                                    <span>
            {((simCurrentPage - 1) * simItemsPerPage) + 1}-{Math.min(simCurrentPage * simItemsPerPage, totalItems)} / {totalItems}件を表示
            (ページ {simCurrentPage} / {totalPages})
        </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    };

    return renderSimList();
}

export default SimList;