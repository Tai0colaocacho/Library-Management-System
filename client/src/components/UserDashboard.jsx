import { useSelector } from "react-redux";
import Header from "../layout/Header";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title-black.png";

const UserDashboard = () => {
  const { userBorrowedBooks } = useSelector((state) => state.borrow);
  const { books } = useSelector((state) => state.book);

  const unreturnedBooks = userBorrowedBooks?.filter((b) => b.status === 'Borrowed' || b.status === 'Overdue') || [];
  const returnedBooks = userBorrowedBooks?.filter((b) => b.status === 'Returned') || [];

  const totalBorrowedBooks = unreturnedBooks.length;
  const totalReturnedBooks = returnedBooks.length;

  const mostBorrowedBook = [...(books || [])].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))[0];
  
  const topBooks = [...(books || [])]
    .filter((b) => b.borrowCount > 0)
    .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
    .slice(0, 4);

  const currentlyBorrowed = unreturnedBooks;

  const suggestedBooks = (books || [])
    .filter((b) => 
        currentlyBorrowed.some((br) => br.book?.category === b.category?._id) && 
        !currentlyBorrowed.some((br) => br.book?._id === b._id)
    )
    .slice(0, 3);

  return (
    <main className="relative flex-1 p-6 pt-28 bg-gray-50 min-h-screen">
      <Header />
      <div className="grid xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
              <div className="bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl">📚</div>
              <div>
                <p className="text-sm text-gray-600">Borrowed Books</p>
                <h3 className="text-xl font-bold">{totalBorrowedBooks}</h3>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
              <div className="bg-gray-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl">✅</div>
              <div>
                <p className="text-sm text-gray-600">Returned Books</p>
                <h3 className="text-xl font-bold">{totalReturnedBooks}</h3>
              </div>
            </div>
          </div>

          {/* MOST BORROWED */}
          {mostBorrowedBook && (
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">🔥 Most Borrowed Book</h3>
              <div className="flex items-center gap-4">
                <img
                  src={mostBorrowedBook.coverImage?.url}
                  alt={mostBorrowedBook.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <p className="text-lg font-medium">{mostBorrowedBook.title}</p>
                  <p className="text-sm text-gray-600">Author: {mostBorrowedBook.author}</p>
                  <p className="text-sm text-gray-500">Borrowed: {mostBorrowedBook.borrowCount || 0} times</p>
                </div>
              </div>
            </div>
          )}

          {/* TOP BORROWED */}
          {topBooks.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">🏆 Top Borrowed Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
                {topBooks.map((book) => (
                  <div key={book._id} className="bg-gray-50 rounded-xl p-4 shadow hover:shadow-md transition flex gap-4">
                    <img src={book.coverImage?.url} alt={book.title} className="w-20 h-28 object-cover rounded" />
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-lg font-semibold">{book.title}</p>
                        <p className="text-sm text-gray-600">Author: {book.author}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Borrowed: {book.borrowCount} times</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CURRENTLY BORROWED */}
          {currentlyBorrowed.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">📚 Your Currently Borrowed Books</h3>
              <table className="w-full text-sm text-left text-gray-700">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Cover</th>
                    <th className="py-2">Title</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentlyBorrowed.map((book) => (
                    <tr key={book._id} className="border-t">
                      <td className="py-2">
                        <img src={book.coverImage?.url} className="h-12 w-8 object-cover rounded" />
                      </td>
                      <td className="py-2">{book.title}</td>
                      <td className="py-2">{book.dueDate || "N/A"}</td>
                      <td className="py-2 text-yellow-600">⏳ Borrowing</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUGGESTED BOOKS */}
          {suggestedBooks.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">💡 Suggested Books For You</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedBooks.map((book) => (
                  <div key={book._id} className="bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <img src={book.coverImage?.url} className="h-40 w-full object-cover rounded mb-3" />
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUOTE */}
          <div className="bg-white p-7 text-lg sm:text-xl xl:text-2xl font-semibold rounded-2xl shadow relative">
            <h4>
              Embarking on the journey of reading fosters personal growth, nurturing a path towards excellence and the refinement of characters.
            </h4>
            <p className="text-gray-700 text-sm sm:text-lg absolute right-6 bottom-3">~ BookWorm Team</p>
          </div>

          <div className="flex justify-center mt-6">
            <img src={logo_with_title} className="w-auto h-12 sm:h-16" />
          </div>
        </div>

        {/* RIGHT SIDEBAR (LOGO / LEGEND) */}
        <div className="flex flex-col items-center gap-8 mt-4 xl:mt-0">
          <div className="bg-white p-6 rounded-xl shadow flex items-center gap-5 w-full max-w-sm">
            <img src={logo} alt="logo" className="h-12 w-auto" />
            <span className="w-[2px] bg-gray-400 h-12"></span>
            <div className="text-gray-700">
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-800"></span> Borrowed
              </p>
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-600"></span> Returned
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;
