import { useState, useEffect, useCallback } from 'react';
import Api from '../../api/Api';
import styles from './List.module.css';
import NotesModal from './NotesModal'; // Import the external component

function CustomerList() {
    const [allCustomerData, setAllCustomerData] = useState([]); // Store all customer data
    const [filteredCustomerList, setFilteredCustomerList] = useState([]); // Filtered data
    const [displayedCustomerList, setDisplayedCustomerList] = useState([]); // Paginated data
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const [searchField, setSearchField] = useState('all'); // Search field selector

    // Pagination calculations
    const totalFilteredItems = filteredCustomerList.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

    // Fetch customers from API
    const fetchCustomers = async (page = 1, pageSize = 1000) => {
        setLoading(true);
        try {
            const response = await Api.call({}, `customers/list?page=${page}&page_size=${pageSize}`, 'get');

            if (response.data && response.data.code === 200) {
                const { customers, pagination } = response.data.data;
                const totalItems = pagination.total;

                // Transform API data to match component structure
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

                // If there are more items than 1000, fetch the rest
                if (totalItems > 1000) {
                    const totalPagesToFetch = Math.ceil(totalItems / 1000);

                    // Fetch remaining pages
                    for (let page = 2; page <= totalPagesToFetch; page++) {
                        const additionalResponse = await Api.call({},
                            `customers/list?page=${page}&page_size=1000`, 'get');

                        if (additionalResponse.data && additionalResponse.data.code === 200) {
                            const additionalCustomers = additionalResponse.data.data.customers.map(customer => ({
                                id: customer.sim_number,
                                SIMNumber: customer.sim_number,
                                customerName: customer.customer_name,
                                affiliatedStore: customer.affiliated_store,
                                contractDate: customer.contract_date,
                                totalMonths: customer.total_months,
                                lastNotificationDate: customer.last_notification,
                                notes: customer.notes === "None" ? "" : customer.notes,
                                bikeId: customer?.bike_id,
                            }));
                            allCustomers = [...allCustomers, ...additionalCustomers];
                        }
                    }
                }

                setAllCustomerData(allCustomers);
                setFilteredCustomerList(allCustomers); // Initially, filtered list is all data
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setAllCustomerData([]);
            setFilteredCustomerList([]);
        } finally {
            setLoading(false);
        }
    };

    // Load all customer data on component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Handle search/filter
    useEffect(() => {
        let filtered = allCustomerData;

        if (searchTerm) {
            filtered = allCustomerData.filter(customer => {
                const searchLower = searchTerm.toLowerCase();

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
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm, searchField, allCustomerData]);

    // Update displayed items based on current page and filtered list
    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredCustomerList.slice(indexOfFirstItem, indexOfLastItem);
        setDisplayedCustomerList(currentItems);
    }, [currentPage, filteredCustomerList, itemsPerPage]);

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

    // Calculate display range
    const startItem = totalFilteredItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search field change
    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value);
    };

    // Clear search
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
        try {
            console.log(selectedCustomer);
            // Call API to save note
            const response = await Api.call(
                { notes: noteText },
                `bikes/${selectedCustomer.bikeId}/updateNotes`,
                'put'
            );

            if (response.data && response.data.code === 200) {
                // Update all data arrays
                const updatedAllData = allCustomerData.map(customer =>
                    customer.SIMNumber === selectedCustomer.SIMNumber
                        ? { ...customer, notes: noteText }
                        : customer
                );
                setAllCustomerData(updatedAllData);

                // Update filtered list
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

    return (
        <>
            <h2 className={styles.h2}>顧客リスト</h2>

            {/* Search Input */}
            <div className={styles.searchContainer}>
                <div className={styles.searchRow}>
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
                            <button
                                className={styles.clearButton}
                                onClick={clearSearch}
                                aria-label="Clear search"
                            >
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
                        <span className={styles.searchTerm}>
                            （「{searchTerm}」で検索中）
                        </span>
                    )}
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
                                    <th scope="col">SIM番号</th>
                                    <th scope="col">顧客名</th>
                                    <th scope="col">所属店舗</th>
                                    <th scope="col">契約日</th>
                                    <th scope="col">契約期間(月)</th>
                                    <th scope="col">最後の楽章</th>
                                    <th scope="col">備考</th>
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
                                            key={customer.SIMNumber}
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

                                {getPageNumbers().map((pageNumber, index) => (
                                    <button
                                        key={index}
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