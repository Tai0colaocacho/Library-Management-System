import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addCopy, updateCopy } from '../store/slices/bookSlice';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ManageCopiesPopup = ({ book, closePopup }) => {
    const dispatch = useDispatch();

    const [editableCopies, setEditableCopies] = useState([]);
    const [newCopyLocation, setNewCopyLocation] = useState('');

    useEffect(() => {
        setEditableCopies(book?.copies.map(copy => ({ ...copy })) || []);
    }, [book]);

    
    const handleCopyFieldChange = (index, field, value) => {
        const updatedCopies = [...editableCopies];
        updatedCopies[index][field] = value;
        setEditableCopies(updatedCopies);
    };
  
    const handleSaveChangesForCopy = (index) => {
        const copyToUpdate = editableCopies[index];
        const { _id, status, location } = copyToUpdate;
        dispatch(updateCopy(book._id, _id, { status, location }));
    };

    const handleAddCopy = () => {
        if (!newCopyLocation.trim()) {
            toast.error("New copy location cannot be empty.");
            return;
        }
        dispatch(addCopy(book._id, { location: newCopyLocation, status: 'Available' }));
        setNewCopyLocation('');
    };

    const allowedStatuses = ['Available', 'Maintenance'];

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col">
                <div className='p-6 border-b flex justify-between items-center'>
                    <h3 className='text-left font-bold text-xl'>Manage Copies: {book.title}</h3>
                    <button onClick={closePopup} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className='p-6 overflow-y-auto flex-grow'>
                    <div className="space-y-4">
                        {editableCopies.map((copy, index) => {
                            const isEditable = !['Borrowed', 'Reserved'].includes(copy.status);
                            return (
                                <div key={copy._id} className={`p-4 border rounded-md grid grid-cols-12 gap-4 items-center ${!isEditable ? 'bg-gray-100' : ''}`}>
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="block text-xs text-gray-500">Location</label>
                                        <input
                                            type="text"
                                            value={copy.location}
                                            onChange={(e) => handleCopyFieldChange(index, 'location', e.target.value)}
                                            className="mt-1 w-full px-2 py-1 border rounded-md"
                                            disabled={!isEditable}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="block text-xs text-gray-500">Status</label>
                                        <select
                                            value={copy.status}
                                            onChange={(e) => handleCopyFieldChange(index, 'status', e.target.value)}
                                            className="mt-1 w-full px-2 py-1 border rounded-md"
                                            disabled={!isEditable}
                                        >
                                            {!isEditable && <option value={copy.status}>{copy.status}</option>}
                                            {isEditable && allowedStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 flex items-end h-full">
                                        <button 
                                            onClick={() => handleSaveChangesForCopy(index)}
                                            className="w-full h-9 px-4 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-300"
                                            disabled={!isEditable}
                                        >
                                            Save
                                        </button>
                                    </div>
                                    <div className="col-span-12 text-xs text-gray-400">Copy ID: {copy._id}</div>
                                </div>
                            );
                        })}
                        {editableCopies.length === 0 && <p className="text-center text-gray-500">No copies found.</p>}
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50">
                    <h4 className="font-semibold mb-2">Add New Copy</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Enter new copy location" 
                            value={newCopyLocation}
                            onChange={(e) => setNewCopyLocation(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                        <button onClick={handleAddCopy} className="px-4 py-2 bg-blue-500 text-white rounded-md whitespace-nowrap">Add Copy</button>
                    </div>
                </div>
                <div className="p-4 bg-gray-100 text-right">
                    <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400'>Close</button>
                </div>
            </div>
        </div>
    );
};

ManageCopiesPopup.propTypes = {
    book: PropTypes.object.isRequired,
    closePopup: PropTypes.func.isRequired,
};

export default ManageCopiesPopup;