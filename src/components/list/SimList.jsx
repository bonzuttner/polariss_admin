//SimManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import styles from './List.module.css';
import Api from '../../api/Api'; // Adjust path as needed

function SimList({ deviceUpdate }) {
    const [allSimData, setAllSimData] = useState([]); // Store all SIM data
    const [filteredSimList, setFilteredSimList] = useState([]); // Filtered data
    const [displayedSimList, setDisplayedSimList] = useState([]); // Paginated data
    const [simLoading, setSimLoading] = useState(true);
    const [simCurrentPage, setSimCurrentPage] = useState(1);
    const [simItemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState(''); // Search term state

    // Pagination calculations
    const totalFilteredItems = filteredSimList.length;
    const totalPages = Math.ceil(totalFilteredItems / simItemsPerPage);



    const fetchSimData = useCallback(async (page = 1, pageSize = 1000) => {
        setSimLoading(true);
        try {
            const response = await Api.call({}, `devices/sim/list?page=${page}&page_size=${pageSize}`, 'get');

            if (response.data && response.data.code === 200) {
                const { sims, pagination } = response.data.data;
                const totalItems = pagination.total;

                // Transform API data to match your component structure
                let allSims = sims.map((sim) => ({
                    id: sim.device_imsi, // Using IMSI as ID
                    deviceName: sim.sim_number,
                    deviceImsi: sim.device_imsi,
                    status: "available", // You might need to get this from API if available
                    createdAt: new Date().toISOString().split('T')[0] // Default date
                }));

                // If there are more items than 1000, fetch the rest
                if (totalItems > 1000) {
                    const totalPagesToFetch = Math.ceil(totalItems / 1000);

                    // Fetch remaining pages
                    for (let page = 2; page <= totalPagesToFetch; page++) {
                        const additionalResponse = await Api.call({},
                            `devices/sim/list?page=${page}&page_size=1000`, 'get');

                        if (additionalResponse.data && additionalResponse.data.code === 200) {
                            const additionalSims = additionalResponse.data.data.sims.map((sim) => ({
                                id: sim.device_imsi,
                                deviceName: sim.sim_number,
                                deviceImsi: sim.device_imsi,
                                status: "available",
                                createdAt: new Date().toISOString().split('T')[0]
                            }));
                            allSims = [...allSims, ...additionalSims];
                        }
                    }
                }

                setAllSimData(allSims);
                setFilteredSimList(allSims); // Initially, filtered list is all data
            }
        } catch (error) {
            console.error('Failed to fetch SIM data:', error);
            setAllSimData([]);
            setFilteredSimList([]);
        } finally {
            setSimLoading(false);
        }
    }, []);

    // Load all SIM data on component mount
    useEffect(() => {
        fetchSimData();
    }, [fetchSimData]);

    // Handle search/filter
    useEffect(() => {
        const filtered = allSimData.filter(sim =>
            sim.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSimList(filtered);
        setSimCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm, allSimData]);

    // Update displayed items based on current page and filtered list
    useEffect(() => {
        const indexOfLastItem = simCurrentPage * simItemsPerPage;
        const indexOfFirstItem = indexOfLastItem - simItemsPerPage;
        const currentItems = filteredSimList.slice(indexOfFirstItem, indexOfLastItem);
        setDisplayedSimList(currentItems);
    }, [simCurrentPage, filteredSimList, simItemsPerPage]);

    // Pagination functions
    const simPaginate = useCallback((pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setSimCurrentPage(pageNumber);
        }
    }, [totalPages]);

    const simNextPage = useCallback(() => {
        if (simCurrentPage < totalPages) {
            setSimCurrentPage(simCurrentPage + 1);
        }
    }, [simCurrentPage, totalPages]);

    const simPrevPage = useCallback(() => {
        if (simCurrentPage > 1) {
            setSimCurrentPage(simCurrentPage - 1);
        }
    }, [simCurrentPage]);

    const simGoToFirstPage = useCallback(() => setSimCurrentPage(1), []);
    const simGoToLastPage = useCallback(() => setSimCurrentPage(totalPages), [totalPages]);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, simCurrentPage - halfVisible);
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

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
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
        return (
            <>
                <h2 className={styles.h2}>SIMリスト（在庫リスト）</h2>

                {/* Search Input */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <svg
                            className={styles.searchIcon}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                stroke="#6c757d"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="SIM番号で検索..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button
                                className={styles.clearButton}
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className={styles.searchInfo}>
                        全{allSimData.length}件中 {filteredSimList.length}件を表示
                        {searchTerm && (
                            <span className={styles.searchTerm}>
                                （「{searchTerm}」で検索中）
                            </span>
                        )}
                    </div>
                </div>

                <div className={`${styles.tableContainer} ${styles.tableReveal}`}>
                    {displayedSimList.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.emptyStateIcon}>
                                <path d="M3 6H21M3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6M3 6L5 3H19L21 6M10 10H14M10 14H14M10 18H14"
                                    stroke="#4611a7" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3>
                                {searchTerm
                                    ? `「${searchTerm}」に一致するSIMが見つかりません`
                                    : 'SIMデータがありません'}
                            </h3>
                            <p>
                                {searchTerm
                                    ? '別のキーワードで検索してください'
                                    : '表示するSIM情報が見つかりませんでした'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <table className={styles.modernTable}>
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ width: '60%', textAlign: 'left' }}>
                                            SIM番号
                                        </th>
                                        <th scope="col" style={{ width: '40%', textAlign: 'center' }}>
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedSimList.map((sim, index) => {
                                        const rowStyle = {
                                            animationDelay: `${index * 0.05}s`,
                                            opacity: 0
                                        };

                                        return (
                                            <tr
                                                key={sim.deviceImsi}
                                                className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${styles.tableRowAnimated}`}
                                                style={rowStyle}
                                            >
                                                <td style={{ width: '60%', textAlign: 'left', paddingLeft: '20px' }}>
                                                    {sim.deviceName}
                                                </td>
                                                <td style={{ width: '40%', textAlign: 'center' }}>
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

                            {/* Pagination controls - only show if there are pages */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
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
                            )}

                            {/* Pagination info */}
                            <div className={styles.paginationInfo}>
                                {totalFilteredItems > 0 && (
                                    <span>
                                        {((simCurrentPage - 1) * simItemsPerPage) + 1}-
                                        {Math.min(simCurrentPage * simItemsPerPage, totalFilteredItems)} /
                                        {totalFilteredItems}件を表示
                                        {totalPages > 1 && ` (ページ ${simCurrentPage} / ${totalPages})`}
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