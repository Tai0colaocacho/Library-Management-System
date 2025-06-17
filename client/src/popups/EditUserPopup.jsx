import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/userSlice';
import PropTypes from 'prop-types';

const EditUserPopup = ({ user, closePopup }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Member', is_active: true });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'Member',
                is_active: user.is_active !== undefined ? user.is_active : true
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUser(user._id, formData));
        closePopup();
    };

    if (!user) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-1/3">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-4 text-xl'>Edit User: {user.name}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md">
                                <option value="Member">Member</option>
                                <option value="Librarian">Librarian</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4" />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">Account is Active</label>
                        </div>
                        <div className='flex justify-end space-x-4 pt-4'>
                            <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-200 rounded-md'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-black text-white rounded-md'>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

EditUserPopup.propTypes = {
    user: PropTypes.object.isRequired,
    closePopup: PropTypes.func.isRequired,
};

export default EditUserPopup;