import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Header from '../layout/Header';
import { updateMyProfile } from '../store/slices/authSlice';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nationalId: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                nationalId: user.nationalId || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                address: user.address || ''
            });
            setAvatarPreview(user.avatar?.url || 'https://via.placeholder.com/150');
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const profileData = new FormData();

        Object.keys(formData).forEach(key => {
            profileData.append(key, formData[key]);
        });

        if (avatar) {
            profileData.append('avatar', avatar);
        }

        dispatch(updateMyProfile(profileData));
    };

    return (
        <main className="relative flex-1 p-6 pt-28 bg-gray-50">
            <Header />
            <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <img src={avatarPreview} alt="Avatar" className="w-40 h-40 rounded-full object-cover border-4 border-gray-200" />
                        </label>
                        <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        <p className="mt-2 text-sm text-gray-500">Click image to change avatar</p>
                    </div>

                    {/* Information Section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">National ID</label>
                            <input type="text" name="nationalId" id="nationalId" value={formData.nationalId} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-5 border-t text-right">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ProfilePage;