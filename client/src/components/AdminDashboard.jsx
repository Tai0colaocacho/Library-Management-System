import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Header from "../layout/Header";
import { Users, Library, BookX, Clock } from "lucide-react";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6">
    <div className={`w-16 h-16 flex items-center justify-center rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { users = [] } = useSelector((state) => state.user);
  const { books = [] } = useSelector((state) => state.book);
  const { allBorrowedBooks = [] } = useSelector((state) => state.borrow);

  const stats = useMemo(() => {
    const membersCount = users.filter(u => u.role === 'Member').length;
    const bookCount = books.length;
    const activeBorrows = allBorrowedBooks.filter(b => b.status === 'Borrowed').length;
    const overdueBooks = allBorrowedBooks.filter(b => b.status === 'Overdue').length;
    return { membersCount, bookCount, activeBorrows, overdueBooks };
  }, [users, books, allBorrowedBooks]);

  const recentTransactions = useMemo(() => {
    return [...allBorrowedBooks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [allBorrowedBooks]);

  const overdueList = useMemo(() => {
    return allBorrowedBooks
      .filter(b => b.status === 'Overdue')
      .slice(0, 5);
  }, [allBorrowedBooks]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <main className="relative flex-1 p-6 pt-28 bg-gray-50">
      <Header />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Members" value={stats.membersCount} icon={<Users className="text-white" size={32}/>} color="bg-blue-500" />
        <StatCard title="Book Titles" value={stats.bookCount} icon={<Library className="text-white" size={32}/>} color="bg-green-500" />
        <StatCard title="Active Borrows" value={stats.activeBorrows} icon={<Clock className="text-white" size={32}/>} color="bg-yellow-500" />
        <StatCard title="Overdue Books" value={stats.overdueBooks} icon={<BookX className="text-white" size={32}/>} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">{item.book?.title}</p>
                  <p className="text-sm text-gray-500">Member: {item.user?.name} | Status: <span className="font-semibold">{item.status}</span></p>
                </div>
                <p className="text-sm text-gray-400">{formatDate(item.updatedAt)}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No recent transactions.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700 mb-4">Overdue Books</h3>
          <div className="space-y-3">
            {overdueList.length > 0 ? overdueList.map(item => (
              <div key={item._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.book?.title}</p>
                  <p className="text-xs text-gray-500">by {item.user?.name}</p>
                </div>
                <p className="text-xs font-bold text-red-600">Due: {formatDate(item.due_date)}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No overdue books.</p>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;