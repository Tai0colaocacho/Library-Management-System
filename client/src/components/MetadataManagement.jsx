import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMetadata, deleteCategory, deleteAuthor, deletePublisher } from "../store/slices/metadataSlice";
import Header from "../layout/Header";
import { Edit, Trash2 } from "lucide-react";
import CategoryPopup from "../popups/CategoryPopup";
import AuthorPopup from "../popups/AuthorPopup";
import PublisherPopup from "../popups/PublisherPopup";

const MetadataManagement = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth); // Lấy thông tin user để kiểm tra role
    const { categories, authors, publishers, loading } = useSelector(state => state.metadata);
    
    const [activeTab, setActiveTab] = useState('Categories');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    useEffect(() => {
        dispatch(fetchAllMetadata());
    }, [dispatch]);

    const handleOpenPopup = (item = null) => {
        setItemToEdit(item);
        setIsPopupOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        switch (activeTab) {
            case 'Categories': dispatch(deleteCategory(id)); break;
            case 'Authors': dispatch(deleteAuthor(id)); break;
            case 'Publishers': dispatch(deletePublisher(id)); break;
            default: return;
        }
    };

    const TABS_CONFIG = {
        Categories: { data: categories, columns: [{ header: 'Name', accessor: 'name' }, { header: 'Description', accessor: 'description' }] },
        Authors: { data: authors, columns: [{ header: 'Name', accessor: 'name' }, { header: 'Biography', accessor: 'biography' }] },
        Publishers: { data: publishers, columns: [{ header: 'Name', accessor: 'name' }, { header: 'Address', accessor: 'address' }, { header: 'Contact Email', accessor: 'contact_email' }] }
    };
    
    const currentConfig = TABS_CONFIG[activeTab];

    return (
        <>
            <main className="relative flex-1 p-6 pt-28 bg-gray-50">
                <Header />
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Metadata Management</h2>
                    {user?.role === 'Admin' && (
                        <button onClick={() => handleOpenPopup()} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">+ Add New {activeTab.slice(0, -1)}</button>
                    )}
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        {Object.keys(TABS_CONFIG).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-4 px-1 border-b-2 font-medium text-sm`}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {currentConfig.columns.map(col => <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}
                                {user?.role === 'Admin' && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(currentConfig.data || []).map(item => (
                                <tr key={item._id}>
                                    {currentConfig.columns.map(col => <td key={col.accessor} className="px-6 py-4 text-sm text-gray-600 whitespace-pre-wrap">{item[col.accessor]}</td>)}
                                    {user?.role === 'Admin' && (
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenPopup(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18}/></button>
                                            <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18}/></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            {/* Popup cũng chỉ mở được nếu là Admin (vì các nút đã bị ẩn) */}
            {isPopupOpen && user?.role === 'Admin' && activeTab === 'Categories' && <CategoryPopup closePopup={() => setIsPopupOpen(false)} categoryToEdit={itemToEdit} />}
            {isPopupOpen && user?.role === 'Admin' && activeTab === 'Authors' && <AuthorPopup closePopup={() => setIsPopupOpen(false)} authorToEdit={itemToEdit} />}
            {isPopupOpen && user?.role === 'Admin' && activeTab === 'Publishers' && <PublisherPopup closePopup={() => setIsPopupOpen(false)} publisherToEdit={itemToEdit} />}
        </>
    );
};

export default MetadataManagement;