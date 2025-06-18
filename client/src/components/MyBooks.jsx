import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../layout/Header";
import { XCircle, BookCheck, Hourglass, History, ShieldAlert } from "lucide-react";
import { cancelReservation } from "../store/slices/borrowSlice";
import { toast } from "react-toastify";

const BooksTable = ({ books, columns }) => {
  if (!books || books.length === 0) {
    return <p className="text-center text-gray-500 py-8">No books in this section.</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((item) => (
            <tr key={item._id}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MyBooks = () => {
  const dispatch = useDispatch();
  const { userBorrowedBooks, loading } = useSelector((state) => state.borrow);

  const [activeTab, setActiveTab] = useState("CURRENTLY_BORROWING");

  const handleCancelReservation = (borrowingId) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
        dispatch(cancelReservation(borrowingId)).then((action) => {
             if(action.payload?.success) {
                 toast.success("Reservation cancelled successfully.");
             }
        });
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusComponent = (status) => {
    switch (status) {
      case "Borrowed":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"><Hourglass size={14} className="mr-1"/> Borrowing</span>;
      case "Overdue":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><ShieldAlert size={14} className="mr-1"/> Overdue</span>;
      case "Reserved":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"><Hourglass size={14} className="mr-1"/> Reserved</span>;
      case "Returned":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><BookCheck size={14} className="mr-1"/> Returned</span>;
      case "Cancelled":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"><XCircle size={14} className="mr-1"/> Cancelled</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const { currentlyBorrowing, reserved, history } = useMemo(() => {
    const books = userBorrowedBooks || []; 
    
    const currentlyBorrowing = books.filter(
      (b) => b.status === "Borrowed" || b.status === "Overdue"
    );
    const reserved = books.filter((b) => b.status === "Reserved");
    const history = books.filter(
      (b) => b.status === "Returned" || b.status === "Cancelled"
    );
    return { currentlyBorrowing, reserved, history };
  }, [userBorrowedBooks]);


  const TABS = {
    CURRENTLY_BORROWING: {
        label: "Currently Borrowing",
        icon: <Hourglass size={18}/>,
        data: currentlyBorrowing,
        columns: [
            { key: "cover", header: "Cover", render: (item) => (
                <img src={item.book?.coverImage?.url || 'https://via.placeholder.com/80x120.png?text=No+Image'} alt={item.book?.title} className="w-12 h-16 object-cover rounded shadow-sm" />
            )},
            { key: "title", header: "Title", render: (item) => item.book?.title || "Unknown Book" },
            { key: "borrow_date", header: "Borrow Date", render: (item) => formatDate(item.borrow_date) },
            { key: "due_date", header: "Due Date", render: (item) => <span className={item.status === 'Overdue' ? 'text-red-600 font-bold' : ''}>{formatDate(item.due_date)}</span> },
            { key: "status", header: "Status", render: (item) => getStatusComponent(item.status) },
        ]
    },
    RESERVED: {
        label: "Reserved Books",
        icon: <BookCheck size={18} />,
        data: reserved,
        columns: [
            { key: "cover", header: "Cover", render: (item) => (
                <img src={item.book?.coverImage?.url || 'https://via.placeholder.com/80x120.png?text=No+Image'} alt={item.book?.title} className="w-12 h-16 object-cover rounded shadow-sm" />
            )},
            { key: "title", header: "Title", render: (item) => item.book?.title || "Unknown Book" },
            { key: "reservation_date", header: "Reservation Date", render: (item) => formatDate(item.reservation_date) },
            { key: "pickup_due_date", header: "Pickup By", render: (item) => formatDate(item.pickup_due_date) },
            { key: "actions", header: "Actions", render: (item) => (
                <button onClick={() => handleCancelReservation(item._id)} className="text-red-600 hover:text-red-900 text-xs font-semibold">
                    Cancel
                </button>
            )},
        ]
    },
    HISTORY: {
        label: "History",
        icon: <History size={18}/>,
        data: history,
        columns: [
            { key: "cover", header: "Cover", render: (item) => (
                <img src={item.book?.coverImage?.url || 'https://via.placeholder.com/80x120.png?text=No+Image'} alt={item.book?.title} className="w-12 h-16 object-cover rounded shadow-sm" />
            )},
            { key: "title", header: "Title", render: (item) => item.book?.title || "Unknown Book" },
            { key: "date", header: "Transaction Date", render: (item) => item.status === 'Returned' ? formatDate(item.return_date) : formatDate(item.updatedAt) },
            { key: "status", header: "Final Status", render: (item) => getStatusComponent(item.status) },
            { key: "fine", header: "Fine", render: (item) => `$${(item.fine || 0).toFixed(2)}` },
        ]
    }
  };

  const activeTabData = TABS[activeTab];

  return (
    <main className="relative flex-1 p-6 pt-28 bg-gray-50 min-h-screen">
      <Header />
      <h2 className="text-2xl font-semibold mb-4">My Books</h2>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 px-4" aria-label="Tabs">
            {Object.keys(TABS).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`${
                  activeTab === tabKey
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                {TABS[tabKey].icon}
                {TABS[tabKey].label}
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {TABS[tabKey].data.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="py-4">
            {loading ? <p className="text-center">Loading data...</p> : <BooksTable books={activeTabData.data} columns={activeTabData.columns} />}
        </div>
      </div>
    </main>
  );
};



export default MyBooks;