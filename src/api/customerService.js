import Api from './Api';



// const fetchCustomers = async (page = 1, pageSize = 5) => {
//     setLoading(true);
//     try {
//         const response = await Api.call({}, `v2/customers/list?page=${page}&page_size=${pageSize}`, 'get');
//
//         if (response.data && response.data.code === 200) {
//             const { customers, pagination } = response.data.data;
//
//             // Transform API data to match your component structure
//             const transformedCustomers = customers.map(customer => ({
//                 id: customer.sim_number, // Using SIM number as ID
//                 SIMNumber: customer.sim_number,
//                 customerName: customer.customer_name,
//                 affiliatedStore: customer.affiliated_store,
//                 contractDate: customer.contract_date,
//                 totalMonths: customer.total_months,
//                 lastNotificationDate: customer.last_notification,
//                 notes: customer.notes === "None" ? "" : customer.notes
//             }));
//
//             setCustomerList(transformedCustomers);
//             setTotalItems(pagination.total);
//             setTotalPages(pagination.total_pages);
//             setCurrentPage(pagination.page);
//         }
//     } catch (error) {
//         console.error('Failed to fetch customers:', error);
//         // Handle error (show message, etc.)
//     } finally {
//         setLoading(false);
//     }
// };