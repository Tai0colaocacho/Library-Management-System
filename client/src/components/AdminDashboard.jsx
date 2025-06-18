import { useState, useEffect } from "react";
import usersIcon from "../assets/people-black.png";
import bookIcon from "../assets/book-square.png";
import reservedIcon from "../assets/save-add.png"; 
import overdueIcon from "../assets/danger.png"; 
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import { useSelector } from "react-redux";
import Header from "../layout/Header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { users = [] } = useSelector((state) => state.user);
  const { books = [] } = useSelector((state) => state.book);
  const { allBorrowedBooks = [] } = useSelector((state) => state.borrow);

  // State to store the calculated statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBooks: 0,
    activeBorrows: 0,
    overdueBooks: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    const membersCount = users.filter(u => u.role === 'Member').length;
    
    const bookCount = books.length;

    const active = allBorrowedBooks.filter(b => b.status === 'Borrowed').length;
    const overdue = allBorrowedBooks.filter(b => b.status === 'Overdue').length;
    const reserved = allBorrowedBooks.filter(b => b.status === 'Reserved').length;

    setStats({
      totalMembers: membersCount,
      totalBooks: bookCount,
      activeBorrows: active,
      overdueBooks: overdue,
      totalReservations: reserved,
    });
  }, [users, books, allBorrowedBooks]);

  const pieChartData = {
    labels: ["Borrowed", "Overdue", "Reserved"],
    datasets: [
      {
        data: [stats.activeBorrows, stats.overdueBooks, stats.totalReservations],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <main className="relative flex-1 p-6 pt-28">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - QUICK STATS */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Total Members Card */}
          <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
            <img src={usersIcon} alt="Users" className="w-12 h-12"/>
            <div>
              <p className="text-gray-500">Total Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
          </div>
          {/* Total Books Card */}
          <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
            <img src={bookIcon} alt="Books" className="w-12 h-12"/>
            <div>
              <p className="text-gray-500">Total Book Titles</p>
              <p className="text-2xl font-bold">{stats.totalBooks}</p>
            </div>
          </div>
           {/* Reserved Books Card */}
           <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
            <img src={reservedIcon} alt="Reserved" className="w-12 h-12"/>
            <div>
              <p className="text-gray-500">Reserved Books</p>
              <p className="text-2xl font-bold">{stats.totalReservations}</p>
            </div>
          </div>
           {/* Overdue Books Card */}
           <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
            <img src={overdueIcon} alt="Overdue" className="w-12 h-12"/>
            <div>
              <p className="text-gray-500">Overdue Books</p>
              <p className="text-2xl font-bold">{stats.overdueBooks}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - CHART & WELCOME */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Book Status Overview</h3>
            <div className="max-w-md mx-auto">
              <Pie data={pieChartData} />
            </div>
          </div>
          <div className="bg-white p-7 text-lg sm:text-xl xl:text-2xl font-semibold relative flex-[3] flex justify-center items-center rounded-2xl shadow">
            <h4 className="overflow-y-hidden text-center">Welcome back, {user.name}!</h4>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;