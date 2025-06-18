import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { reserveCopy, directBorrowBook } from '../store/slices/borrowSlice';
import { useState, useMemo, useEffect } from 'react';
import { HandPlatter } from 'lucide-react';

const BookDetailPopup = ({ book, closePopup }) => {
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);
    const { userBorrowedBooks, loading: borrowLoading } = useSelector(state => state.borrow);
    const { settings } = useSelector(state => state.settings);

    const [selectedCopyId, setSelectedCopyId] = useState(null);

    const [lendMemberEmail, setLendMemberEmail] = useState('');
    const [selectedCopyToLend, setSelectedCopyToLend] = useState('');

    const availableCopies = useMemo(() => 
        book.copies.filter(copy => copy.status === 'Available'),
        [book.copies]
    );

    useEffect(() => {
        if (availableCopies.length > 0) {
            setSelectedCopyToLend(availableCopies[0]._id.toString());
        } else {
            setSelectedCopyToLend('');
        }
    }, [availableCopies]);


    const hasReachedLimit = useMemo(() => {
        if (!userBorrowedBooks || !settings) return false;
        const currentlyHoldingCount = userBorrowedBooks.filter(
            b => b.status === 'Reserved' || b.status === 'Borrowed' || b.status === 'Overdue'
        ).length;
        return currentlyHoldingCount >= settings.max_books_per_user;
    }, [userBorrowedBooks, settings]);

    const handleReserve = () => {
        if (!selectedCopyId) return toast.error("Please select an available copy to reserve.");
        dispatch(reserveCopy({ copyId: selectedCopyId, bookId: book._id })).unwrap()
            .then(() => {
                toast.success("Reservation successful!");
                closePopup();
            })
            .catch((error) => {
                toast.error(error || "Reservation failed. Please try again.");
            });
    };

    const handleDirectLend = (e) => {
        e.preventDefault();
        if (!selectedCopyToLend) return toast.error("Please select a copy to lend.");
        dispatch(directBorrowBook({ memberEmail: lendMemberEmail, copyId: selectedCopyToLend })).unwrap()
            .then(() => {
                toast.success("Book lent successfully!");
                closePopup();
            })
            .catch((error) => {
                toast.error(error.message || "Failed to lend the book.");
            });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'Borrowed': return 'bg-yellow-100 text-yellow-800';
            case 'Reserved': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (!book) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-3/4 lg:w-2/3 max-h-[90vh] flex flex-col">
                <div className='p-6 border-b flex justify-between items-center'>
                    <h3 className='text-left font-bold text-xl'>Book Details</h3>
                    <button onClick={closePopup} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className='p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6'>

                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        <img
                            src={book.coverImage?.url || 'https://via.placeholder.com/150x220.png?text=No+Image'}
                            alt={book.title}
                            className="w-48 h-auto object-cover border rounded-md shadow-lg mb-4"
                        />
                        <h4 className="text-xl font-bold">{book.title}</h4>
                        <p className="text-md text-gray-600">by {book.authors?.map(a => a.name).join(', ')}</p>

                        <div className="mt-4 text-sm text-left w-full">
                            <div className="flex justify-between border-t pt-2"><span className="font-semibold text-gray-700">Category:</span><span className="text-gray-600">{book.category?.name || 'N/A'}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-700">Publisher:</span><span className="text-gray-600">{book.publisher?.name || 'N/A'}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-700">Published:</span><span className="text-gray-600">{formatDate(book.publication_date)}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-700">Pages:</span><span className="text-gray-600">{book.page_count || 'N/A'}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-700">Price:</span><span className="text-gray-600">${book.price?.toFixed(2) || 'N/A'}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-gray-700">ISBN:</span><span className="text-gray-600">{book.isbn}</span></div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-semibold text-lg mb-2 border-b pb-2">Description</h4>
                        <p className="text-sm text-gray-700 max-h-40 overflow-y-auto pr-2">{book.description}</p>

                        <h4 className="font-semibold text-lg mt-6 mb-2 border-b pb-2">Copies ({book.copies.length})</h4>

                        {user?.role === 'Member' && (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {book.copies.map(copy => (
                                    <div
                                        key={copy._id}
                                        onClick={() => copy.status === 'Available' && setSelectedCopyId(copy._id.toString())}
                                        className={`p-3 border rounded-md flex items-center justify-between gap-4 bg-gray-50 ${copy.status === 'Available' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${selectedCopyId === copy._id.toString() ? 'ring-2 ring-blue-400' : ''}`}
                                    >
                                        <div>
                                            <p className="font-medium">Location: <span className="text-gray-600 font-normal">{copy.location}</span></p>
                                            <p className="text-xs text-gray-400">Copy ID: {copy._id}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(copy.status)}`}>{copy.status}</span>
                                    </div>
                                ))}
                                {book.copies.length === 0 && <p className="text-gray-500 text-center mt-4">No copies found for this book.</p>}
                            </div>
                        )}
                        
                        {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                            <div>
                                <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md">
                                    {availableCopies.length > 0 ? availableCopies.map(copy => (
                                        <label key={copy._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                            <input type="radio" name="copySelection" value={copy._id} checked={selectedCopyToLend === copy._id.toString()} onChange={(e) => setSelectedCopyToLend(e.target.value)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                                            <div>
                                                <p className="font-medium text-gray-800">Location: {copy.location}</p>
                                                <p className="text-xs text-gray-500">Copy ID: {copy._id}</p>
                                            </div>
                                        </label>
                                    )) : <p className="text-gray-500 text-center py-4">No available copies to lend.</p>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="lendMemberEmail" className="block text-sm font-medium text-gray-700">Lend to Member (Email) <span className="text-red-500">*</span></label>
                                    <input type="email" id="lendMemberEmail" value={lendMemberEmail} onChange={e => setLendMemberEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="member@example.com" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-end items-center gap-3 border-t">
                    {user?.role === 'Member' && (
                        <>
                            {hasReachedLimit && <p className="text-red-500 text-sm">You have reached the maximum borrowing/reservation limit.</p>}
                            <button
                                type='button'
                                onClick={handleReserve}
                                disabled={borrowLoading || hasReachedLimit || !selectedCopyId}
                                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400'
                            >
                                {borrowLoading ? 'Reserving...' : 'Reserve This Copy'}
                            </button>
                        </>
                    )}
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <button
                            type="button"
                            onClick={handleDirectLend}
                            disabled={borrowLoading || availableCopies.length === 0 || !lendMemberEmail || !selectedCopyToLend}
                            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2'
                        >
                            <HandPlatter size={18} /> {borrowLoading ? 'Processing...' : 'Confirm Lend'}
                        </button>
                    )}
                    <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400'>Close</button>
                </div>
            </div>
        </div>
    );
};

BookDetailPopup.propTypes = {
    book: PropTypes.object.isRequired,
    closePopup: PropTypes.func.isRequired,
};

export default BookDetailPopup;