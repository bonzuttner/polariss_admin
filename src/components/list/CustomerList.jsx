import {useState, useEffect, useCallback} from 'react';
import Api from '../../api/Api';
import styles from './List.module.css';
import NotesModal from './NotesModal'; // Import the external component


function CustomerList() {
    const [ customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [noteText, setNoteText] = useState('');

    // Fetch customers from API
    const fetchCustomers = async (page = 1, pageSize = 5) => {
        setLoading(true);
        try {
            const response = await Api.call({}, `customers/list?page=${page}&page_size=${pageSize}`, 'get');

            if (response.data && response.data.code === 200) {
                const { customers, pagination } = response.data.data;
                // Transform API data to match component structure
                const transformedCustomers = customers.map(customer => ({
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

                setCustomerList(transformedCustomers);
                setTotalItems(pagination.total);
                setTotalPages(pagination.total_pages);
                setCurrentPage(pagination.page);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            // You might want to add error state handling here
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    // Pagination functions
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);

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
    const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Notes modal functions
    const openNotesModal = useCallback((customer) => {
        setSelectedCustomer(customer);
        setNoteText(customer.notes || '');
        setShowNotesModal(true);
    },[]);

    const closeNotesModal =useCallback( () => {
        setShowNotesModal(false);
        setSelectedCustomer(null);
        setNoteText('');
    },[]);

    const saveNote = useCallback( async () => {
        try {

            console.log(selectedCustomer);
            // Call API to save note
            const response = await Api.call(
                { notes: noteText },
                `bikes/${selectedCustomer.bikeId}/updateNotes`,
                'put' // Change to 'put' if your API uses PUT
            );

            if (response.data && response.data.code === 200) {
                // Update local state
                const updatedList = customerList.map(customer =>
                    customer.SIMNumber === selectedCustomer.SIMNumber
                        ? { ...customer, notes: noteText }
                        : customer
                );

                setCustomerList(updatedList);
                closeNotesModal();
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            // Handle error (show message to user, etc.)
        }
    },[noteText,selectedCustomer]);


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
            <div className={`${styles.tableContainer} ${styles.tableReveal}`}>
                {customerList.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.emptyStateIcon}>
                            <path d="M3 6H21M3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6M3 6L5 3H19L21 6M10 10H14M10 14H14M10 18H14"
                                  stroke="#4611a7" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h3>顧客データがありません</h3>
                        <p>表示する顧客情報が見つかりませんでした</p>
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
                                <th scope="col">最終通知日</th>
                                <th scope="col">備考</th>
                                <th scope="col">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {customerList.map((customer, index) => {
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
                                        <td>{customer.affiliatedStore   || 'None'}</td>
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

                        {/* Enhanced Pagination controls */}
                        <div className={styles.pagination}>
                            {/* First and Previous buttons */}
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

                            {/* Page numbers */}
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

                            {/* Next and Last buttons */}
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

                        {/* Pagination info */}
                        <div className={styles.paginationInfo}>
                            {totalItems > 0 && (
                                <span>
                                    {startItem}-{endItem} / {totalItems}件を表示
                                    (ページ {currentPage} / {totalPages})
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