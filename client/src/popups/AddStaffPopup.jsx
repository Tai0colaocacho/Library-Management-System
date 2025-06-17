import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addStaff } from '../store/slices/userSlice';
import PropTypes from 'prop-types';

const AddStaffPopup = ({ closePopup }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Librarian' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addStaff(formData));
        closePopup();
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-1/3">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-4 text-xl'>Add New Staff Member</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name-add" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name-add" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="email-add" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email-add" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="password-add" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" id="password-add" name="password" value={formData.password} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="role-add" className="block text-sm font-medium text-gray-700">Role</label>
                            <select id="role-add" name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md">
                                <option value="Librarian">Librarian</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className='flex justify-end space-x-4 pt-4'>
                            <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-200 rounded-md'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-black text-white rounded-md'>Add Staff</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

AddStaffPopup.propTypes = {
    closePopup: PropTypes.func.isRequired,
};

export default AddStaffPopup;