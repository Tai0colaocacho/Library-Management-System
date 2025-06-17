import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { reportLostOrDamaged } from '../store/slices/borrowSlice';
import PropTypes from 'prop-types';

const ReportStatusPopup = ({ borrowing, closePopup }) => {
    const dispatch = useDispatch();
    const [status, setStatus] = useState('Lost');

    const handleSubmit = () => {
        dispatch(reportLostOrDamaged(borrowing._id, status));
        closePopup();
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-1/3">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-1 text-xl'>Report Book Status</h3>
                    <p className="text-sm text-gray-600 mb-4">Book: {borrowing.book.title}</p>
                    <div className='mb-4'>
                        <label htmlFor="status-report" className="block text-sm font-medium text-gray-700">Final Status</label>
                        <select 
                            id="status-report"
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)} 
                            className="mt-1 w-full px-3 py-2 border rounded-md"
                        >
                            <option value="Lost">Lost</option>
                            <option value="Damaged">Damaged</option>
                        </select>
                    </div>
                    <div className='flex justify-end space-x-4'>
                        <button onClick={closePopup} className='px-4 py-2 bg-gray-200 rounded-md'>Cancel</button>
                        <button onClick={handleSubmit} className='px-4 py-2 bg-red-600 text-white rounded-md'>Confirm Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReportStatusPopup.propTypes = {
    borrowing: PropTypes.object.isRequired,
    closePopup: PropTypes.func.isRequired,
};

export default ReportStatusPopup;