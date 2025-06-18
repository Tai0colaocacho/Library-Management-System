import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../store/slices/userSlice';

const AddUserPopup = ({ closePopup }) => {
    const dispatch = useDispatch();
    // Lấy thông tin người dùng đang đăng nhập để kiểm tra vai trò
    const { user: loggedInUser } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Member', 
        nationalId: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addUser(formData));
        closePopup();
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-4 flex items-center justify-center z-50'>
            <div className="w-full bg-white rounded-lg shadow-lg max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-6 text-xl'>Add New User</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="name" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role" onChange={handleChange} value={formData.role} className="mt-1 w-full px-3 py-2 border rounded-md" disabled={loggedInUser?.role === 'Librarian'}>
                                    {loggedInUser?.role === 'Librarian' && <option value="Member">Member</option>}
                                    {loggedInUser?.role === 'Admin' && (
                                        <>
                                            <option value="Member">Member</option>
                                            <option value="Librarian">Librarian</option>
                                            <option value="Admin">Admin</option>
                                        </>
                                    )}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700">National ID</label>
                                <input type="text" name="nationalId" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="text" name="phoneNumber" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input type="date" name="dateOfBirth" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input type="text" name="address" onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                            </div>
                        </div>
                        <div className='flex justify-end space-x-4 pt-4'>
                            <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-200 rounded-md'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-black text-white rounded-md'>Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserPopup;