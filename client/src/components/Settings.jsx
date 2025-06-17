import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../store/slices/settingsSlice';
import Header from '../layout/Header';

const Settings = () => {
    const dispatch = useDispatch();
    const { settings, loading } = useSelector(state => state.settings);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value);
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateSettings(formData));
    };

    if (loading && !settings) {
        return <div className="flex-1 p-6 pt-28">Loading system settings...</div>;
    }

    return (
        <main className="relative flex-1 p-6 pt-28">
            <Header />
            <h2 className="text-2xl font-semibold mb-6">System Settings</h2>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                {/* --- Library Name --- */}
                <div className="mb-6">
                    <label htmlFor="library_name" className="block text-lg font-medium text-gray-800">
                        Library Name
                    </label>
                    <input
                        type="text"
                        name="library_name"
                        id="library_name"
                        value={formData.library_name || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">The official name of the library, displayed throughout the system.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* --- Loan Period --- */}
                    <div>
                        <label htmlFor="loan_period_days" className="block text-sm font-medium text-gray-700">
                            Loan Period (days)
                        </label>
                        <input
                            type="number"
                            name="loan_period_days"
                            id="loan_period_days"
                            value={formData.loan_period_days || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Default number of days a member can borrow a book.</p>
                    </div>

                    {/* --- Max Books Per User --- */}
                    <div>
                        <label htmlFor="max_books_per_user" className="block text-sm font-medium text-gray-700">
                            Max Books Per Member
                        </label>
                        <input
                            type="number"
                            name="max_books_per_user"
                            id="max_books_per_user"
                            value={formData.max_books_per_user || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Total number of books a member can borrow or reserve at the same time.</p>
                    </div>

                    {/* --- Fine Per Day --- */}
                    <div>
                        <label htmlFor="fine_per_day" className="block text-sm font-medium text-gray-700">
                            Fine Per Day ($)
                        </label>
                        <input
                            type="number"
                            name="fine_per_day"
                            id="fine_per_day"
                            step="0.01"
                            value={formData.fine_per_day || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Amount charged for each day a book is overdue.</p>
                    </div>

                    {/* --- Grace Period --- */}
                    <div>
                        <label htmlFor="grace_period_days" className="block text-sm font-medium text-gray-700">
                            Grace Period (days)
                        </label>
                        <input
                            type="number"
                            name="grace_period_days"
                            id="grace_period_days"
                            value={formData.grace_period_days || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Number of days after the due date before fines start accruing. Set to 0 for no grace period.</p>
                    </div>

                     {/* --- Pickup Time Limit --- */}
                    <div>
                        <label htmlFor="pickup_time_limit_hours" className="block text-sm font-medium text-gray-700">
                           Reservation Pickup Limit (hours)
                        </label>
                        <input
                            type="number"
                            name="pickup_time_limit_hours"
                            id="pickup_time_limit_hours"
                            value={formData.pickup_time_limit_hours || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">How long a member has to pick up a reserved book before the reservation is cancelled.</p>
                    </div>

                    {/* --- Lost Book Fee Multiplier --- */}
                    <div>
                        <label htmlFor="lost_book_fee_multiplier" className="block text-sm font-medium text-gray-700">
                            Lost Book Fee Multiplier
                        </label>
                        <input
                            type="number"
                            name="lost_book_fee_multiplier"
                            id="lost_book_fee_multiplier"
                            step="0.1"
                            value={formData.lost_book_fee_multiplier || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">e.g., 1.5 = 150% of the book&apos;s price will be charged if lost.</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* --- Password Min Length --- */}
                        <div>
                            <label htmlFor="password_min_length" className="block text-sm font-medium text-gray-700">
                                Minimum Password Length
                            </label>
                            <input
                                type="number"
                                name="password_min_length"
                                id="password_min_length"
                                value={formData.password_min_length || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Minimum number of characters required for a user&apos;s password.</p>
                        </div>

                        {/* --- Password Requires Special Char --- */}
                        <div className="pt-7">
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="password_requires_special_char"
                                        name="password_requires_special_char"
                                        type="checkbox"
                                        checked={!!formData.password_requires_special_char}
                                        onChange={handleInputChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="password_requires_special_char" className="font-medium text-gray-700">
                                        Require Special Characters
                                    </label>
                                    <p className="text-gray-500 text-xs">Force passwords to include special characters (e.g., !, @, #, $).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 pt-5 border-t border-gray-200 text-right">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default Settings;