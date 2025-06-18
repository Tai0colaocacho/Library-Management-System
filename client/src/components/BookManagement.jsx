import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
import { fetchAllBooks, resetBookSlice, deleteBook } from "../store/slices/bookSlice";
import { fetchAllMetadata } from "../store/slices/metadataSlice";
import Header from "../layout/Header";
import AddBookPopup from "../popups/AddBookPopup";
import EditBookPopup from "../popups/EditBookPopup";
import ManageCopiesPopup from "../popups/ManageCopiesPopup";
import BookDetailPopup from "../popups/BookDetailPopup";
import { BookA, NotebookPen, Edit, Trash2, LayoutGrid, List } from "lucide-react";

const BookManagement = () => {
  const dispatch = useDispatch();
  const { books = [] } = useSelector((state) => state.book);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { addBookPopup } = useSelector((state) => state.popup);
  const { categories = [] } = useSelector(state => state.metadata);
  const { authors = [] } = useSelector(state => state.metadata);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [bookForDetail, setBookForDetail] = useState(null);
  const [bookForEdit, setBookForEdit] = useState(null);
  const [bookForCopies, setBookForCopies] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    dispatch(fetchAllMetadata());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedAuthor) params.authorId = selectedAuthor;
    if (searchedKeyword) params.keyword = searchedKeyword;
    
    dispatch(fetchAllBooks(params));
  }, [dispatch, selectedCategory, selectedAuthor, searchedKeyword]);

  const searchedBooks = useMemo(() => {
    if (!searchedKeyword) {
      return books;
    }
    return books.filter((book) =>
      (book.title || '').toLowerCase().includes(searchedKeyword) ||
      (book.isbn || '').toLowerCase().includes(searchedKeyword)
    );
  }, [books, searchedKeyword]);
  
  const groupedBooks = useMemo(() => {
    return searchedBooks.reduce((acc, book) => {
        const categoryName = book.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(book);
        return acc;
    }, {});
  }, [searchedBooks]);

  const handleDeleteBook = (bookId, bookTitle) => {
    if (window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      dispatch(deleteBook(bookId));
    }
  };

  const AdminActions = ({ book }) => (
    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setBookForDetail(book)} title="View Details" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 transition-colors"><BookA size={18} /></button>
      <button onClick={() => setBookForEdit(book)} title="Edit Book" className="p-2 text-gray-500 hover:text-orange-600 rounded-full hover:bg-gray-200 transition-colors"><Edit size={18} /></button>
      <button onClick={() => setBookForCopies(book)} title="Manage Copies" className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-200 transition-colors"><NotebookPen size={18} /></button>
      {user.role === "Admin" && (<button onClick={() => handleDeleteBook(book._id, book.title)} title="Delete Book" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200 transition-colors"><Trash2 size={18} /></button>)}
    </div>
  );

  return (
    <>
      <main className="relative flex-1 p-6 pt-28 bg-gray-50">
        <Header />
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
                {user?.role === "Member" ? "Browse Books" : "Book Management"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-500'}`}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} title="List View" className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500'}`}><List size={20} /></button>
                </div>
                <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory} className="border p-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <select onChange={(e) => setSelectedAuthor(e.target.value)} value={selectedAuthor} className="border p-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Authors</option>
                    {authors.map(author => <option key={author._id} value={author._id}>{author.name}</option>)}
                </select>
                <input type="text" placeholder="Search books..." className="w-full sm:w-48 border p-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchedKeyword} onChange={(e) => setSearchedKeyword(e.target.value)} />
                {isAuthenticated && user?.role === "Admin" && (<button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors" onClick={() => dispatch(toggleAddBookPopup())}><span>+</span> Add Book</button>)}
            </div>
        </header>

        {Object.keys(groupedBooks).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
                <section key={category}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-500 inline-block">{category}</h2>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {booksInCategory.map((book) => (
                                <div key={book._id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onClick={user?.role === 'Member' ? () => setBookForDetail(book) : () => {}}>
                                    <div className={`relative ${user?.role === 'Member' ? 'cursor-pointer' : 'cursor-default'}`}>
                                        <img src={book.coverImage?.url || 'https://placehold.co/300x450/EFEFEF/AAAAAA?text=No+Image'} alt={book.title} className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg ${book.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>{book.isAvailable ? 'Available' : 'Unavailable'}</span>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-base font-bold text-gray-800 truncate" title={book.title}>{book.title}</h3>
                                        <p className="text-xs text-gray-500 mb-2 flex-grow">by {book.authors.map(a => a.name).join(', ')}</p>
                                        <div className="text-xs text-gray-500">Copies: <span className="font-semibold text-gray-700">{book.availableCopiesCount || 0}</span></div>
                                    </div>
                                    {user?.role !== 'Member' && <div className="p-2 bg-gray-50 border-t"><AdminActions book={book} /></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Author</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        {user?.role !== 'Member' && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {booksInCategory.map((book) => (
                                        <tr key={book._id} onClick={user?.role === 'Member' ? () => setBookForDetail(book) : () => {}} className={`${user?.role === 'Member' ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                                            <td className="px-6 py-4"><img src={book.coverImage?.url || 'https://placehold.co/80x120/EFEFEF/AAAAAA?text=N/A'} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm"/></td>
                                            <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{book.title}</div><div className="text-sm text-gray-500">{book.authors.map(a => a.name).join(', ')}</div></td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{book.isbn}</td>
                                            <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{book.isAvailable ? 'Available' : 'Unavailable'}</span></td>
                                            {user?.role !== 'Member' && <td className="px-6 py-4 text-right"><AdminActions book={book} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><h3 className="text-2xl font-semibold text-gray-600">No books found</h3><p className="text-gray-400">Try adjusting your search query.</p></div>
        )}
      </main>

      {addBookPopup && <AddBookPopup />}
      {bookForDetail && (<BookDetailPopup book={bookForDetail} closePopup={() => setBookForDetail(null)} />)}
      {bookForEdit && (<EditBookPopup book={bookForEdit} closePopup={() => setBookForEdit(null)} />)}
      {bookForCopies && (<ManageCopiesPopup book={bookForCopies} closePopup={() => setBookForCopies(null)} />)}
    </>
  );
};

export default BookManagement;