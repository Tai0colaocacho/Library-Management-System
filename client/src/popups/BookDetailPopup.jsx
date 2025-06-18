import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { reserveCopy } from '../store/slices/borrowSlice';
import { useState, useMemo, useEffect } from 'react';

const BookDetailPopup = ({ book, closePopup }) => {
    const dispatch = useDispatch();
    const [selectedCopyId, setSelectedCopyId] = useState(null);
    const [selectedCopyStatus, setSelectedCopyStatus] = useState(null);
    const [copiesState, setCopiesState] = useState(book.copies || []);
    const { user } = useSelector(state => state.auth);
    const { userBorrowedBooks } = useSelector(state => state.borrow);
    const { settings } = useSelector(state => state.settings);

    const hasReachedLimit = useMemo(() => {
        if (!userBorrowedBooks || !settings) return false;

        const currentlyHoldingCount = userBorrowedBooks.filter(
            b => b.status === 'Reserved' || b.status === 'Borrowed' || b.status === 'Overdue'
        ).length;

        return currentlyHoldingCount >= settings.max_books_per_user;

    }, [userBorrowedBooks, settings]);

    useEffect(() => {
        if (book?.copies) {
            setCopiesState(book.copies);
        }
    }, [book]);

    if (!book) return null;

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-800';
            case 'Borrowed':
                return 'bg-yellow-100 text-yellow-800';
            case 'Reserved':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const handleCopyClick = (copy) => {
        if (user?.role !== 'Member') return;

        setSelectedCopyId(copy._id);
        setSelectedCopyStatus(copy.status);
        if (copy.status !== 'Available') {
            toast.info(`This copy is currently ${copy.status}. You cannot reserve it now.`);
        }
    };

    const handleReserve = async () => {
        if (!selectedCopyId || selectedCopyStatus !== 'Available') return;

        try {
            const action = await dispatch(reserveCopy(selectedCopyId, book._id));
            const result = action.payload;

            if (result?.success) {
                setCopiesState((prev) =>
                    prev.map((copy) =>
                        copy._id === selectedCopyId ? { ...copy, status: 'Reserved' } : copy
                    )
                );
                setSelectedCopyId(null);
                setSelectedCopyStatus(null);
                toast.success("Reservation successful!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Reservation failed.");
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-3/4 lg:w-2/3 max-h-[90vh] flex flex-col">
                <div className='p-6 border-b flex justify-between items-center'>
                    <h3 className='text-left font-bold text-xl'>Book Details</h3>
                    <button onClick={closePopup} className="text-gray-400 hover:text-gray-600">&times;</button>
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
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-gray-700">Category:</span>
                                <span className="text-gray-600">{book.category?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-700">Publisher:</span>
                                <span className="text-gray-600">{book.publisher?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-700">Published:</span>
                                <span className="text-gray-600">{formatDate(book.publication_date)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-700">Pages:</span>
                                <span className="text-gray-600">{book.page_count || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-700">Price:</span>
                                <span className="text-gray-600">${book.price?.toFixed(2) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-700">ISBN:</span>
                                <span className="text-gray-600">{book.isbn}</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-semibold text-lg mb-2 border-b pb-2">Description</h4>
                        <p className="text-sm text-gray-700 max-h-40 overflow-y-auto pr-2">{book.description}</p>

                        <h4 className="font-semibold text-lg mt-6 mb-2 border-b pb-2">Copies ({copiesState.length})</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {copiesState.map(copy => (
                                <div
                                    key={copy._id}
                                    onClick={() => handleCopyClick(copy)}
                                    className={`p-3 border rounded-md flex items-center justify-between gap-4 bg-gray-50 cursor-pointer ${selectedCopyId === copy._id ? 'ring-2 ring-blue-400' : ''}`}
                                >
                                    <div>
                                        <p className="font-medium">Location: <span className="text-gray-600 font-normal">{copy.location}</span></p>
                                        <p className="text-xs text-gray-400">Copy ID: {copy._id}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(copy.status)}`}>
                                        {copy.status}
                                    </span>
                                </div>
                            ))}
                            {copiesState.length === 0 && (
                                <p className="text-gray-500 text-center mt-4">No copies found for this book.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-end gap-3 border-t">
                    {user?.role === 'Member' && (
                        <>
                            {hasReachedLimit && (
                                <p className="text-red-500 text-sm mt-1">Bạn đã đạt giới hạn 5 bản sao được đặt/mượn.</p>
                            )}
                            {selectedCopyId && selectedCopyStatus === 'Available' && !hasReachedLimit && (
                                <button
                                    type='button'
                                    onClick={handleReserve}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                                >
                                    Đặt chỗ
                                </button>
                            )}
                        </>
                    )}
                    <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400'>Close</button>
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
