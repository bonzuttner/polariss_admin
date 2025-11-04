import { useState, useEffect, useCallback } from 'react';
import Api from '../../api/Api';
import styles from './List.module.css';
import NotesModal from './NotesModal';

function CustomerList() {
    const [allCustomerData, setAllCustomerData] = useState([]);
    const [filteredCustomerList, setFilteredCustomerList] = useState([]);
    const [displayedCustomerList, setDisplayedCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [showTooltip, setShowTooltip] = useState(false);



    // New state for sorting
    const [sortKey, setSortKey] = useState('SIMNumber');
    const [sortDirection, setSortDirection] = useState('ASC');

    // Available sort keys
    const sortKeys = [
        { value: "userRole", label: "ユーザー役割" },
        { value: "userID", label: "ユーザーID" },
        { value: "parentRole", label: "親役割" },
        { value: "parentID", label: "親ID" },
        { value: "grandParentID", label: "祖父ID" },
        { value: "SIMNumber", label: "SIM番号" },
        { value: "imsi", label: "IMSI" },
        { value: "customerName", label: "顧客名" },
        { value: "affiliatedStore", label: "所属店舗" },
        { value: "contractDate", label: "契約日" },
        { value: "totalMonths", label: "契約期間" },
        { value: "lastMovementDt", label: "最終移動日" },
        { value: "Notes", label: "備考" }
    ];

    const totalFilteredItems = filteredCustomerList.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

    // Fetch customers from API with sorting - FIXED: use useCallback to prevent infinite re-renders
    const fetchCustomers = useCallback(async (page = 1, pageSize = 1000, sortKey = 'SIMNumber', sortDirection = 'ASC') => {
        setLoading(true);
        try {
            const response = await Api.call(
                {},
                `customers/list?page=${page}&page_size=${pageSize}&sort_key=${sortKey}&sort_direction=${sortDirection}`,
                'get'
            );

            if (response.data && response.data.code === 200) {
                const { customers, pagination } = response.data.data;
                const totalItems = pagination.total;

                let allCustomers = customers.map(customer => ({
                    id: customer.sim_number,
                    SIMNumber: customer.sim_number,
                    customerName: customer.customer_name,
                    affiliatedStore: customer.affiliated_store,
                    contractDate: customer.contract_date,
                    totalMonths: customer.total_months,
                    lastNotificationDate: customer.last_movement_dt,
                    notes: customer.notes === "None" ? "" : customer.notes,
                    bikeId: customer?.bike_id,
                }));

                if (totalItems > 1000) {
                    const totalPagesToFetch = Math.ceil(totalItems / 1000);

                    for (let page = 2; page <= totalPagesToFetch; page++) {
                        const additionalResponse = await Api.call(
                            {},
                            `customers/list?page=${page}&page_size=1000&sort_key=${sortKey}&sort_direction=${sortDirection}`,
                            'get'
                        );

                        if (additionalResponse.data && additionalResponse.data.code === 200) {
                            const additionalCustomers = additionalResponse.data.data.customers.map(customer => ({
                                id: customer.sim_number,
                                SIMNumber: customer.sim_number,
                                customerName: customer.customer_name,
                                affiliatedStore: customer.affiliated_store,
                                contractDate: customer.contract_date,
                                totalMonths: customer.total_months,
                                lastNotificationDate: customer.last_movement_dt,
                                notes: customer.notes === "None" ? "" : customer.notes,
                                bikeId: customer?.bike_id,
                            }));
                            allCustomers = [...allCustomers, ...additionalCustomers];
                        }
                    }
                }

                setAllCustomerData(allCustomers);
                setFilteredCustomerList(allCustomers);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setAllCustomerData([]);
            setFilteredCustomerList([]);
        } finally {
            setLoading(false);
        }
    }, []);
    const handleExportCSV = async () => {
        const loggedId = localStorage.getItem('userId');

        try {
            // Step 1: Get response as text
            const response = await Api.call(
                {},
                `customers/export/csv?sort_key=${sortKey}&sort_direction=${sortDirection}`,
                'get',
                loggedId,
                'blob'
            );

            // Step 2: Convert blob to text (raw CSV string)
            const csvText = await response.data;

            // Step 3: Ensure proper line endings for Excel
            const normalizedCsv = csvText.replace(/\r?\n/g, '\r\n');

            // Step 4: Prepend BOM for UTF-8 (important for Japanese)
            const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

            // Step 5: Create Blob with correct MIME type
            const csvBlob = new Blob([bom, normalizedCsv], {
                type: 'application/vnd.ms-excel;charset=utf-8;', // Excel-friendly type
            });

            // Step 6: Create download link
            const url = window.URL.createObjectURL(csvBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `customers_${sortKey}_${sortDirection}_${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('CSVエクスポートに失敗しました。');
        }
    };

    // Load customer data when sort parameters change - FIXED: proper dependencies
    useEffect(() => {
        fetchCustomers(1, 1000, sortKey, sortDirection);
    }, [sortKey, sortDirection, fetchCustomers]);

    // Handle search/filter - FIXED: use useCallback for filter function
    const filterCustomers = useCallback(() => {
        let filtered = allCustomerData;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = allCustomerData.filter(customer => {
                switch (searchField) {
                    case 'sim':
                        return customer.SIMNumber?.toLowerCase().includes(searchLower);
                    case 'name':
                        return customer.customerName?.toLowerCase().includes(searchLower);
                    case 'store':
                        return customer.affiliatedStore?.toLowerCase().includes(searchLower);
                    case 'notes':
                        return customer.notes?.toLowerCase().includes(searchLower);
                    case 'all':
                    default:
                        return (
                            customer.SIMNumber?.toLowerCase().includes(searchLower) ||
                            customer.customerName?.toLowerCase().includes(searchLower) ||
                            customer.affiliatedStore?.toLowerCase().includes(searchLower) ||
                            customer.notes?.toLowerCase().includes(searchLower)
                        );
                }
            });
        }

        setFilteredCustomerList(filtered);
        setCurrentPage(1);
    }, [searchTerm, searchField, allCustomerData]);

    useEffect(() => {
        filterCustomers();
    }, [filterCustomers]);

    // Update displayed items based on current page and filtered list - FIXED: simplified
    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredCustomerList.slice(indexOfFirstItem, indexOfLastItem);
        setDisplayedCustomerList(currentItems);
    }, [currentPage, filteredCustomerList, itemsPerPage]);

    // Sorting handlers
    const handleSortKeyChange = (e) => {
        setSortKey(e.target.value);
    };

    const handleSortDirectionChange = () => {
        setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    };

    // Pagination functions
    const paginate = useCallback((pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const goToFirstPage = useCallback(() => setCurrentPage(1), []);
    const goToLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);

    // Generate page numbers for pagination
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
    }, [currentPage, totalPages]);

    const startItem = totalFilteredItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);

    // Search handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Notes modal functions
    const openNotesModal = useCallback((customer) => {
        setSelectedCustomer(customer);
        setNoteText(customer.notes || '');
        setShowNotesModal(true);
    }, []);

    const closeNotesModal = useCallback(() => {
        setShowNotesModal(false);
        setSelectedCustomer(null);
        setNoteText('');
    }, []);

    const saveNote = useCallback(async () => {
        if (!selectedCustomer) return;

        try {
            const response = await Api.call(
                { notes: noteText },
                `bikes/${selectedCustomer.bikeId}/updateNotes`,
                'put'
            );

            if (response.data && response.data.code === 200) {
                const updatedAllData = allCustomerData.map(customer =>
                    customer.SIMNumber === selectedCustomer.SIMNumber
                        ? { ...customer, notes: noteText }
                        : customer
                );
                setAllCustomerData(updatedAllData);

                const updatedFilteredList = filteredCustomerList.map(customer =>
                    customer.SIMNumber === selectedCustomer.SIMNumber
                        ? { ...customer, notes: noteText }
                        : customer
                );
                setFilteredCustomerList(updatedFilteredList);

                closeNotesModal();
            }
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    }, [noteText, selectedCustomer, allCustomerData, filteredCustomerList, closeNotesModal]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>顧客データを読み込み中...</p>
            </div>
        );
    }

    const pageNumbers = getPageNumbers();
    const currentSortKeyLabel = sortKeys.find(k => k.value === sortKey)?.label;

    const handleSort = (columnKey) => {
        if (sortKey === columnKey) {
            setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortKey(columnKey);
            setSortDirection('ASC'); // reset to ASC when switching column
        }
    };

    return (
        <>
            <h2 className={styles.h2}>顧客リスト</h2>

            {/* Sorting Controls */}
            <div className={styles.sortingContainer}>
                <div className={styles.sortingRow}>


                    {/* New Export CSV Button */}
                    <div className={`${styles.sortControl} ${styles.tooltipContainer}`}>
                        <button
                            className={`${styles.btn}  ${styles.btnSm} ${styles.btnPrimary}`}
                            onClick={handleExportCSV}
                        >
                            CSVエクスポート
                        </button>
                        <div className={styles.tooltip}>
                            CSVをエクスポートする前に、左側のフィルターを指定してください
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className={styles.searchContainer}>
                <div className={styles.searchRow}>
                    <div className={styles.searchInputWrapper}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                            placeholder={
                                searchField === 'sim' ? 'SIM番号で検索...' :
                                    searchField === 'name' ? '顧客名で検索...' :
                                        searchField === 'store' ? '所属店舗で検索...' :
                                            searchField === 'notes' ? '備考で検索...' :
                                                '検索...'
                            }
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button className={styles.clearButton} onClick={clearSearch} aria-label="Clear search">
                                ×
                            </button>
                        )}
                    </div>
                    <select
                        className={styles.searchSelect}
                        value={searchField}
                        onChange={handleSearchFieldChange}
                    >
                        <option value="all">すべて</option>
                        <option value="sim">SIM番号</option>
                        <option value="name">顧客名</option>
                        <option value="store">所属店舗</option>
                        <option value="notes">備考</option>
                    </select>
                </div>
                <div className={styles.searchInfo}>
                    全{allCustomerData.length}件中 {filteredCustomerList.length}件を表示
                    {searchTerm && (
                        <span className={styles.searchTerm}>（「{searchTerm}」で検索中）</span>
                    )}
                    <span className={styles.sortInfo}>
                        （{currentSortKeyLabel}で{sortDirection === 'ASC' ? '昇順' : '降順'}に並び替え）
                    </span>
                </div>
            </div>

            <div className={`${styles.tableContainer} ${styles.tableReveal}`}>
                {displayedCustomerList.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.emptyStateIcon}>
                            <path d="M3 6H21M3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6M3 6L5 3H19L21 6M10 10H14M10 14H14M10 18H14"
                                  stroke="#4611a7" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h3>
                            {searchTerm
                                ? `「${searchTerm}」に一致する顧客が見つかりません`
                                : '顧客データがありません'}
                        </h3>
                        <p>
                            {searchTerm
                                ? '別のキーワードで検索してください'
                                : '表示する顧客情報が見つかりませんでした'}
                        </p>
                    </div>
                ) : (
                    <>
                        <table className={styles.modernTable}>
                            <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('SIMNumber')}
                                >
                                    SIM番号 {sortKey === 'SIMNumber' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('customerName')}
                                >
                                    顧客名 {sortKey === 'customerName' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('affiliatedStore')}
                                >
                                    所属店舗 {sortKey === 'affiliatedStore' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('contractDate')}
                                >
                                    契約日 {sortKey === 'contractDate' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('totalMonths')}
                                >
                                    契約期間(月) {sortKey === 'totalMonths' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('lastMovementDt')}
                                >
                                    最終通信 {sortKey === 'lastMovementDt' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort('Notes')}
                                >
                                    備考 {sortKey === 'Notes' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th scope="col">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {displayedCustomerList.map((customer, index) => {
                                const rowStyle = {
                                    animationDelay: `${index * 0.05}s`,
                                    opacity: 0
                                };

                                return (
                                    <tr
                                        key={`${customer.SIMNumber}-${index}`} // FIXED: Added index to key for better uniqueness
                                        className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${styles.tableRowAnimated}`}
                                        style={rowStyle}
                                    >
                                        <td>{customer.SIMNumber}</td>
                                        <td>{customer.customerName}</td>
                                        <td>{customer.affiliatedStore || 'None'}</td>
                                        <td>{customer.contractDate || 'None'}</td>
                                        <td>{customer.totalMonths || 'None'}</td>
                                        <td>{customer.lastNotificationDate}</td>
                                        <td>{customer.notes || 'None'}</td>
                                        <td>
                                            <button
                                                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                onClick={() => openNotesModal(customer)}
                                            >
                                                備考 {customer.notes ? '✓' : ''}
                                            </button>
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
                                    onClick={goToFirstPage}
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
                                        key={`page-${index}-${pageNumber}`} // FIXED: Better key for pagination
                                        className={`${styles.btn} ${styles.btnSm} ${pageNumber === currentPage
                                            ? styles.btnPrimary
                                            : pageNumber === '...'
                                                ? styles.btnOutline
                                                : styles.btnOutline
                                        }`}
                                        onClick={() => pageNumber !== '...' && paginate(pageNumber)}
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
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
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
                                    {startItem}-{endItem} / {totalFilteredItems}件を表示
                                    {totalPages > 1 && ` (ページ ${currentPage} / ${totalPages})`}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            <NotesModal
                showNotesModal={showNotesModal}
                selectedCustomer={selectedCustomer}
                noteText={noteText}
                setNoteText={setNoteText}
                closeNotesModal={closeNotesModal}
                saveNote={saveNote}
            />
        </>
    );
}

export default CustomerList;