import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBorrowedBooks, confirmPickup, returnBookAdmin, renewBook } from "../store/slices/borrowSlice"; 
import Header from "../layout/Header";
import ReportStatusPopup from "../popups/ReportStatusPopup";
import { Search, BookUp } from "lucide-react";
import DirectBorrowPopup from "../popups/DirectBorrowPopup";
const Catalog = () => {
  const dispatch = useDispatch();
  const { allBorrowedBooks = [], loading } = useSelector((state) => state.borrow);

  const [activeTab, setActiveTab] = useState("Reserved");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [isDirectBorrowPopupOpen, setIsDirectBorrowPopupOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  const filteredAndSearchedBooks = useMemo(() => {
  const lowercasedFilter = searchTerm.toLowerCase();
    
  return allBorrowedBooks
      .filter(book => { 
        if (activeTab === 'Overdue') {
            return book.status === 'Overdue';
        }
        return book.status === activeTab;
      })
      .filter(item => { 
        if (!searchTerm) return true;
        const bookTitle = item.book?.title?.toLowerCase() || '';
        const userName = item.user?.name?.toLowerCase() || '';
        const userEmail = item.user?.email?.toLowerCase() || '';
        return bookTitle.includes(lowercasedFilter) || 
               userName.includes(lowercasedFilter) ||
               userEmail.includes(lowercasedFilter);
      });
  }, [allBorrowedBooks, activeTab, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleReportClick = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReportPopupOpen(true);
  };

  const tabs = ["Reserved", "Borrowed", "Overdue", "Returned", "Cancelled"];

  return (
    <>
      <main className="relative flex-1 p-6 pt-28 ">
        <Header />
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-4">
            <h2 className="text-xl font-medium md:text-2xl md:font-semibold">Transaction Management</h2>
            <button 
                onClick={() => setIsDirectBorrowPopupOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                <BookUp size={18} />
                Direct Borrow
            </button>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by book title, member name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date / Pickup By</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading transactions...</td></tr>
              ) : filteredAndSearchedBooks.length > 0 ? (
                filteredAndSearchedBooks.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                        <img src={item.book?.coverImage?.url || 'https://via.placeholder.com/80x120.png?text=N/A'} alt={item.book?.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    </td>
                    <td className="px-4 py-4 align-middle">{item.book?.title || 'Unknown Book'}</td>
                    <td className="px-4 py-4 align-middle">
                        <div className="font-semibold text-gray-900">{item.user?.name || 'Unknown User'}</div>
                        <div className="text-gray-500 text-xs">{item.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 align-middle">{formatDate(item.status === 'Reserved' ? item.pickup_due_date : item.due_date)}</td>
                    <td className="px-4 py-4 text-center space-x-2 align-middle">
                      {item.status === 'Reserved' && (
                          <button onClick={() => dispatch(confirmPickup(item._id))} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Confirm Pickup</button>
                      )}
                      {(item.status === 'Borrowed' || item.status === 'Overdue') && (
                        <>
                          <button onClick={() => dispatch(returnBookAdmin(item._id))} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Return</button>
                          <button onClick={() => dispatch(renewBook(item._id))} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Renew</button>
                          <button onClick={() => handleReportClick(item)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Report</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No transactions match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      {isDirectBorrowPopupOpen && <DirectBorrowPopup closePopup={() => setIsDirectBorrowPopupOpen(false)} />}
      {isReportPopupOpen && <ReportStatusPopup borrowing={selectedBorrowing} closePopup={() => setIsReportPopupOpen(false)} />}
    </>
  );
};


export default Catalog;