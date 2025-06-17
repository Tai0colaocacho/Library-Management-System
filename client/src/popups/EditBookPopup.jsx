import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBook } from '../store/slices/bookSlice';
import PropTypes from 'prop-types';

const EditBookPopup = ({ book, closePopup }) => {
    const dispatch = useDispatch();
    
    // Lấy dữ liệu metadata từ Redux store để làm gợi ý (autocomplete)
    const { authors, categories, publishers } = useSelector(state => state.metadata);

    // State cho các trường dữ liệu của form
    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        authorNames: '',
        categoryName: '',
        publisherName: '',
        description: '',
        price: '',
        page_count: '',
        publication_date: ''
    });

    // State cho file ảnh và ảnh xem trước
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // useEffect này sẽ chạy mỗi khi component nhận được một `book` mới để sửa
    // Nó có nhiệm vụ điền dữ liệu của sách vào form
    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title || '',
                isbn: book.isbn || '',
                authorNames: book.authors?.map(a => a.name).join(', ') || '',
                categoryName: book.category?.name || '',
                publisherName: book.publisher?.name || '',
                description: book.description || '',
                price: book.price || '',
                page_count: book.page_count || '',
                publication_date: book.publication_date ? new Date(book.publication_date).toISOString().split('T')[0] : ''
            });
            // Hiển thị ảnh bìa hiện tại của sách khi mở popup
            setImagePreview(book.coverImage?.url || 'https://via.placeholder.com/150x200.png?text=Cover');
            // Reset file đã chọn để không bị gửi nhầm file cũ
            setCoverImageFile(null); 
        }
    }, [book]);

    // Xử lý thay đổi cho các ô input text/number/date
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý khi người dùng chọn một file ảnh mới
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImageFile(file); // Lưu file mới vào state
            setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước ảnh mới
        }
    };

    // Xử lý khi submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        const bookData = new FormData();
        
        // Gắn tất cả dữ liệu text vào FormData
        Object.keys(formData).forEach(key => {
            if (key !== "authorNames") { // Xử lý tác giả riêng
                bookData.append(key, formData[key] || '');
            }
        });
        
        // Xử lý và gắn mảng tác giả
        const authorsArray = formData.authorNames ? formData.authorNames.split(',').map(name => name.trim()).filter(name => name) : [];
        authorsArray.forEach(author => bookData.append("authorNames", author));
        
        // Chỉ gắn file ảnh nếu người dùng đã chọn một file mới
        if (coverImageFile) {
            bookData.append("coverImage", coverImageFile);
        }

        dispatch(updateBook(book._id, bookData));
        closePopup();
    };

    if (!book) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50 overflow-y-auto'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2 max-h-[95vh] overflow-y-auto">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-6 text-xl'>Edit Book Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="flex flex-col items-center gap-4">
                            <label htmlFor="cover-image-edit" className="cursor-pointer">
                                <img src={imagePreview} alt="Cover Preview" className="w-32 h-48 object-cover border rounded-md shadow-sm"/>
                            </label>
                            <span className="text-sm text-gray-500">Click image to change cover</span>
                            <input id="cover-image-edit" type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="title-edit" className="block text-sm font-medium text-gray-700">Book Title (*)</label>
                                <input type='text' id="title-edit" name="title" value={formData.title} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                            <div>
                                <label htmlFor="isbn-edit" className="block text-sm font-medium text-gray-700">ISBN (*)</label>
                                <input type='text' id="isbn-edit" name="isbn" value={formData.isbn} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                             <div>
                                <label htmlFor="authorNames-edit" className="block text-sm font-medium text-gray-700">Author(s), comma-separated (*)</label>
                                <input list="authors-list" id="authorNames-edit" name="authorNames" value={formData.authorNames} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="authors-list">
                                    {authors.map(author => <option key={author._id} value={author.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="categoryName-edit" className="block text-sm font-medium text-gray-700">Category (*)</label>
                                <input list="categories-list" id="categoryName-edit" name="categoryName" value={formData.categoryName} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="categories-list">
                                    {categories.map(cat => <option key={cat._id} value={cat.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="publisherName-edit" className="block text-sm font-medium text-gray-700">Publisher (*)</label>
                                <input list="publishers-list" id="publisherName-edit" name="publisherName" value={formData.publisherName} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="publishers-list">
                                    {publishers.map(pub => <option key={pub._id} value={pub.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="price-edit" className="block text-sm font-medium text-gray-700">Price (for replacement) (*)</label>
                                <input type='number' id="price-edit" name="price" value={formData.price} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                             <div>
                                <label htmlFor="publication_date-edit" className="block text-sm font-medium text-gray-700">Publication Date</label>
                                <input type='date' id="publication_date-edit" name="publication_date" value={formData.publication_date} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md text-gray-500' />
                            </div>
                             <div>
                                <label htmlFor="page_count-edit" className="block text-sm font-medium text-gray-700">Page Count</label>
                                <input type='number' id="page_count-edit" name="page_count" value={formData.page_count} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description-edit" className="block text-sm font-medium text-gray-700">Description (*)</label>
                            <textarea id="description-edit" name="description" value={formData.description} onChange={handleChange} className='mt-1 w-full px-4 py-2 border rounded-md' rows={4} required></textarea>
                        </div>
                        
                        <div className='flex justify-end space-x-4 pt-4'>
                            <button type='button' onClick={closePopup} className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800'>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

EditBookPopup.propTypes = {
    book: PropTypes.object.isRequired,
    closePopup: PropTypes.func.isRequired,
};

export default EditBookPopup;