import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBorrowedBooks, confirmPickup, returnBookAdmin, renewBook } from "../store/slices/borrowSlice"; // Thêm các action mới
import Header from "../layout/Header";
import ReportStatusPopup from "../popups/ReportStatusPopup";

const Catalog = () => {
  const dispatch = useDispatch();
  const { allBorrowedBooks, loading, error, message } = useSelector((state) => state.borrow);
  const [activeTab, setActiveTab] = useState("Reserved"); 

  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  const filteredBooks = allBorrowedBooks.filter(book => {
    if (activeTab === 'Overdue') {
        return book.status === 'Borrowed' && new Date(book.due_date) < new Date();
    }
    return book.status === activeTab;
  });

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
        <h2 className="text-xl font-medium md:text-2xl md:font-semibold mb-4">Transaction Management</h2>

        {/* Thanh Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
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

        {/* Bảng dữ liệu */}
        <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-3 text-left">Book Title</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Due Date / Pickup By</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-4">{item.book.title}</td>
                  <td className="px-4 py-4">{item.user.name}</td>
                  <td className="px-4 py-4">{formatDate(item.status === 'Reserved' ? item.pickup_due_date : item.due_date)}</td>
                  <td className="px-4 py-4 text-center space-x-2">
                    {item.status === 'Reserved' && (
                        <button onClick={() => dispatch(confirmPickup(item._id))} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Confirm Pickup</button>
                    )}
                    {(item.status === 'Borrowed' || (item.status === 'Borrowed' && new Date(item.due_date) < new Date())) && (
                      <>
                        <button onClick={() => dispatch(returnBookAdmin(item._id))} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Confirm Return</button>
                        <button onClick={() => dispatch(renewBook(item._id))} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Renew</button>
                        <button onClick={() => handleReportClick(item)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Report Lost/Damaged</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {filteredBooks.length === 0 && <p className="text-center text-gray-500 mt-4">No transactions in this category.</p>}
      </main>
      {isReportPopupOpen && <ReportStatusPopup borrowing={selectedBorrowing} closePopup={() => setIsReportPopupOpen(false)} />}
    </>
  );
};

export default Catalog;