import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Header from "../layout/Header";
import { BookCheck, Clock, TrendingUp, Trophy } from "lucide-react";

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { userBorrowedBooks = [] } = useSelector((state) => state.borrow);
  const { books = [] } = useSelector((state) => state.book);

  const { unreturnedBooks, returnedBooks } = useMemo(() => {
    const unreturned = userBorrowedBooks.filter((b) => b.status === 'Borrowed' || b.status === 'Overdue');
    const returned = userBorrowedBooks.filter((b) => b.status === 'Returned');
    return { unreturnedBooks: unreturned, returnedBooks: returned };
  }, [userBorrowedBooks]);

  const mostPopularBook = useMemo(() => {
    return [...books].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))[0];
  }, [books]);
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <main className="relative flex-1 p-6 pt-28 bg-gray-50 min-h-screen">
      <Header />
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h2>
        <p className="text-gray-500">Here's your reading summary and what's popular in the library.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md flex items-start gap-4">
              <div className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg">
                <Clock size={24}/>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currently Borrowing</p>
                <h3 className="text-2xl font-bold">{unreturnedBooks.length}</h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md flex items-start gap-4">
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-lg">
                <BookCheck size={24}/>
              </div>
              <div>
                <p className="text-sm text-gray-600">Books Returned</p>
                <h3 className="text-2xl font-bold">{returnedBooks.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Currently Borrowed Books</h3>
            {unreturnedBooks.length > 0 ? (
              <div className="space-y-4">
                {unreturnedBooks.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <img src={item.book.coverImage?.url} alt={item.book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{item.book.title}</p>
                      <p className={`text-sm ${item.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        Due: {formatDate(item.due_date)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">You have no borrowed books currently.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2"><Trophy size={22} className="text-yellow-500"/> Most Popular</h3>
             {mostPopularBook ? (
                <div className="flex gap-4">
                    <img src={mostPopularBook.coverImage?.url} alt={mostPopularBook.title} className="w-20 h-28 object-cover rounded-md shadow-lg" />
                    <div>
                        <p className="font-bold text-gray-800">{mostPopularBook.title}</p>
                        <p className="text-sm text-gray-500 mb-2">by {mostPopularBook.authors.map(a => a.name).join(', ')}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp size={14}/> Borrowed {mostPopularBook.borrowCount || 0} times</p>
                    </div>
                </div>
             ) : <p>No data</p>}
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-lg shadow-xl text-center">
            <h4 className="text-2xl font-bold mb-2">"A reader lives a thousand lives before he dies."</h4>
            <p className="text-gray-400">~ George R.R. Martin</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;