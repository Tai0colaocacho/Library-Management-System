import React, { useEffect, useState } from "react";
import { BookA, NotebookPen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAddBookPopup,
  toggleRecordBookPopup,
} from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import {
  fetchAllBooks,
  resetBookSlice,
} from "../store/slices/bookSlice";
import {
  fetchAllBorrowedBooks,
  resetBorrowSlice,
} from "../store/slices/borrowSlice";
import Header from "../layout/Header";
import AddBookPopup from "../popups/AddBookPopup";
import RecordBookup from "../popups/RecordBookPopup";
import { useNavigate } from "react-router-dom";

const BookManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, books } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { addBookPopup, recordBookPopup } = useSelector((state) => state.popup);
  const {
    loading: borrowSliceLoading,
    error: borrowSliceError,
    message: borrowSliceMessage,
  } = useSelector((state) => state.borrow);

  const [borrowBookId, setBorrowBookId] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");

  useEffect(() => {
    if (message || borrowSliceMessage) {
      toast.success(message || borrowSliceMessage);
      dispatch(fetchAllBooks());
      dispatch(fetchAllBorrowedBooks());
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
    if (error || borrowSliceError) {
      toast.error(error || borrowSliceError);
      dispatch(resetBookSlice());
      dispatch(resetBorrowSlice());
    }
  }, [dispatch, message, error, loading, borrowSliceError, borrowSliceLoading, borrowSliceMessage]);

  const handleSearch = (e) => {
    setSearchedKeyword(e.target.value.toLowerCase());
  };

  const searchedBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchedKeyword)
  );

  const openSeriesDetailPage = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const openRecordBookPopup = (bookId) => {
    setBorrowBookId(bookId);
    dispatch(toggleRecordBookPopup());
  };

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header />

        {/* Sub Header */}
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
            {user && user.role === "Admin" ? "Book Management" : "Books"}
          </h2>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {isAuthenticated && user?.role === "Admin" && (
              <button
                className="relative pl-14 w-full sm:w-52 flex gap-4 justify-center items-center py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800"
                onClick={() => dispatch(toggleAddBookPopup())}
              >
                <span className="bg-white flex justify-center items-center overflow-hidden rounded-full text-black w-[25px] h-[25px] text-[27px] absolute left-5">+</span>
                Add Book
              </button>
            )}
            <input
              type="text"
              placeholder="Search books..."
              className="w-full sm:w-52 border p-2 border-gray-300 rounded-md"
              value={searchedKeyword}
              onChange={handleSearch}
            />
          </div>
        </header>

        {/* Book Cards */}
        {searchedBooks.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchedBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3
                  className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                  onClick={() => openSeriesDetailPage(book._id)}
                >
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">Author: {book.author}</p>
                {isAuthenticated && user?.role === "Admin" && (
                  <p className="text-sm text-gray-600 mb-1">Quantity: {book.quantity}</p>
                )}
                <p className="text-sm text-gray-600 mb-1">Price: ${book.price}</p>
                <p
                  className={`text-sm font-medium mb-2 ${book.availability ? "text-green-600" : "text-red-600"}`}
                >
                  {book.availability ? "Available" : "Unavailable"}
                </p>
                {isAuthenticated && user?.role === "Admin" && (
                  <div className="mt-auto flex justify-center gap-4 pt-2 border-t">
                    <BookA
                      className="cursor-pointer text-blue-600 hover:scale-110 transition"
                      onClick={() => openSeriesDetailPage(book._id)}
                    />
                    <NotebookPen
                      className="cursor-pointer text-green-600 hover:scale-110 transition"
                      onClick={() => openRecordBookPopup(book._id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <h3 className="text-3xl mt-5 font-medium">No books found in library!</h3>
        )}
      </main>

      {addBookPopup && <AddBookPopup />}
      {recordBookPopup && <RecordBookup bookId={borrowBookId} />}
    </>
  );
};

export default BookManagement;
