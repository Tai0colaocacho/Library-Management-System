import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAddBookPopup,
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
import ManageCopiesPopup from "../popups/ManageCopiesPopup";
import EditBookPopup from "../popups/EditBookPopup";
import BookDetailPopup from "../popups/BookDetailPopup";
import { BookA, NotebookPen, Edit, Trash2 } from "lucide-react";
import { deleteBook } from "../store/slices/bookSlice";

const BookManagement = () => {
  const dispatch = useDispatch();
  const { books } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { addBookPopup, recordBookPopup } = useSelector((state) => state.popup);
  const { error: bookError, message: bookMessage } = useSelector((state) => state.book);
  const { error: borrowError, message: borrowMessage } = useSelector((state) => state.borrow);
  const [borrowBookId, setBorrowBookId] = useState("");
    const [searchedKeyword, setSearchedKeyword] = useState("");

    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const [isCopiesPopupOpen, setIsCopiesPopupOpen] = useState(false);

    const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

    useEffect(() => {
        if (bookMessage) {
          toast.success(bookMessage);
          dispatch(resetBookSlice()); // Reset ngay sau khi hiển thị
        }
        if (bookError) {
          toast.error(bookError);
          dispatch(resetBookSlice()); // Reset ngay sau khi hiển thị
        }
    }, [bookMessage, bookError, dispatch]);
    
    useEffect(() => {
        if (borrowMessage) {
          toast.success(borrowMessage);
          dispatch(fetchAllBooks()); // Cần tải lại sách khi mượn/trả thành công
          dispatch(fetchAllBorrowedBooks());
          dispatch(resetBorrowSlice()); // Reset ngay sau khi hiển thị
        }
        if (borrowError) {
          toast.error(borrowError);
          dispatch(resetBorrowSlice()); // Reset ngay sau khi hiển thị
        }
      }, [borrowMessage, borrowError, dispatch]);

  const handleSearch = (e) => {
    setSearchedKeyword(e.target.value.toLowerCase());
  };

  const searchedBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchedKeyword)
  );

  const handleDeleteBook = (bookId, bookTitle) => {
    if (window.confirm(`Are you sure you want to delete the book "${bookTitle}"? This action cannot be undone.`)) {
      dispatch(deleteBook(bookId));
    }
  };

  const openDetailPopup = (book) => {
    setSelectedBook(book);
    setIsDetailPopupOpen(true);
};

  const openEditBookPopup = (book) => {
    setSelectedBook(book);
    setIsEditPopupOpen(true);
  };
    
  const openManageCopiesPopup = (book) => {
    setSelectedBook(book); 
    setIsCopiesPopupOpen(true);
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
              placeholder="Search books by title, ISBN..."
              className="w-full sm:w-52 border p-2 border-gray-300 rounded-md"
              value={searchedKeyword}
              onChange={handleSearch}
            />
          </div>
        </header>

        {/* Book Cards - Đã được cập nhật */}
        {searchedBooks.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchedBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col"
              >
                <img
                  src={book.coverImage?.url || 'https://via.placeholder.com/150'} // Thêm fallback image
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3
                  className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                  onClick={() => openDetailPopup(book._id)}
                >
                  {book.title}
                </h3>
                {/* Hiển thị thêm thông tin */}
                <p className="text-sm text-gray-500 mb-1">by {book.authors.map(a => a.name).join(', ')}</p>
                <p className="text-sm text-gray-600 mb-1">ISBN: {book.isbn}</p>
                
                {/* Hiển thị số lượng bản sao còn lại */}
                <p className={`text-sm font-medium mb-2 ${book.isAvailable ? "text-green-600" : "text-red-600"}`}>
                  {book.isAvailable 
                    ? `${book.availableCopiesCount} available` 
                    : "Unavailable"}
                </p>

                {isAuthenticated && user?.role === "Admin" && (
                  <div className="mt-auto flex justify-around gap-2 pt-2 border-t">
                    <button className="text-blue-600 hover:scale-110 transition" title="View Details" onClick={() => openDetailPopup(book)}>
                        <BookA size={20} />
                    </button>
                    <button className="text-orange-500 hover:scale-110 transition" title="Edit Book" onClick={() => openEditBookPopup(book)}>
                      <Edit size={20} />
                    </button>
                    <button className="text-green-600 hover:scale-110 transition" title="Manage Copies" onClick={() => openManageCopiesPopup(book)}>
                        <NotebookPen size={20}/>
                    </button>
                    <button 
                      className="text-red-600 hover:scale-110 transition" 
                      title="Delete Book"
                      onClick={() => handleDeleteBook(book._id, book.title)}
                    >
                        <Trash2 size={20}/>
                    </button>
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
      {isEditPopupOpen && <EditBookPopup book={selectedBook} closePopup={() => setIsEditPopupOpen(false)} />}
      {isCopiesPopupOpen && <ManageCopiesPopup book={selectedBook} closePopup={() => setIsCopiesPopupOpen(false)} />}
      {isDetailPopupOpen && <BookDetailPopup book={selectedBook} closePopup={() => setIsDetailPopupOpen(false)} />}
    </>
  );
};

export default BookManagement;
