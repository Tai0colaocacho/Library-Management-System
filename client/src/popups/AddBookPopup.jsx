import { useState } from "react";
import { useDispatch } from "react-redux";
import { addBook } from "../store/slices/bookSlice";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { useSelector } from "react-redux";

const AddBookPopup = () => {
  const dispatch = useDispatch();
    const { authors, categories, publishers } = useSelector(state => state.metadata);
    const [coverImage, setCoverImage] = useState(null); // State để giữ file ảnh
    const [imagePreview, setImagePreview] = useState(null);
  // State cho các trường thông tin chính của sách
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    authorNames: "", // Sẽ được chuyển thành mảng trước khi gửi
    categoryName: "",
    publisherName: "",
    description: "",
    publication_date: "",
    page_count: "",
    price: "" // Thêm trường giá sách để tính phí thay thế
  });

  // State cho danh sách các bản sao vật lý
  const [initialCopies, setInitialCopies] = useState([{ location: "", status: "Available" }]);

  // Xử lý thay đổi trên các trường input thông thường
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi trên trường location của một bản sao
  const handleCopyChange = (index, event) => {
    const values = [...initialCopies];
    values[index].location = event.target.value;
    setInitialCopies(values);
  };

  // Thêm một ô nhập liệu cho bản sao mới
  const handleAddCopyField = () => {
    setInitialCopies([...initialCopies, { location: "", status: "Available" }]);
  };

  // Xóa một ô nhập liệu bản sao
  const handleRemoveCopyField = (index) => {
    const values = [...initialCopies];
    values.splice(index, 1);
    setInitialCopies(values);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        setCoverImage(null);
        setImagePreview(null);
    }
};
  // Gửi dữ liệu lên server
  const handleAddBook = (e) => {
    e.preventDefault();
    const bookData = new FormData(); // <<== THAY ĐỔI QUAN TRỌNG: DÙNG FORMDATA
    
    // Thêm các trường dữ liệu vào FormData
    bookData.append("title", formData.title);
    bookData.append("isbn", formData.isbn);
    bookData.append("categoryName", formData.categoryName);
    bookData.append("publisherName", formData.publisherName);
    bookData.append("description", formData.description);
    bookData.append("publication_date", formData.publication_date);
    bookData.append("page_count", formData.page_count);
    bookData.append("price", formData.price);

    // Thêm mảng tác giả
    const authors = formData.authorNames ? formData.authorNames.split(',').map(name => name.trim()).filter(name => name) : [];
    if (authors.length > 0) {
        // Append từng tác giả với CÙNG MỘT KEY là "authorNames"
        authors.forEach(author => {
            bookData.append("authorNames", author);
        });
    } else {
        // Nếu không có tác giả nào, gửi một chuỗi rỗng để backend không bị undefined
        bookData.append("authorNames", "");
    }

    // Thêm mảng các bản sao (stringify)
    const validCopies = initialCopies.filter(copy => copy.location.trim());
    bookData.append("initialCopies", JSON.stringify(validCopies));
    
    // Thêm file ảnh nếu có
    if (coverImage) {
        bookData.append("coverImage", coverImage);
    }

    dispatch(addBook(bookData)); // Gửi FormData đi
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50 overflow-y-auto'>
            <div className="w-full bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2 max-h-[95vh] overflow-y-auto">
                <div className='p-6'>
                    <h3 className='text-left font-bold mb-6 text-xl'>Add New Book</h3>
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <label htmlFor="cover-image-upload" className="cursor-pointer">
                                <img 
                                    src={imagePreview || 'https://via.placeholder.com/150x200.png?text=Cover'} 
                                    alt="Cover Preview" 
                                    className="w-32 h-48 object-cover border rounded-md"
                                />
                            </label>
                             <span className="text-sm text-gray-500">Click image to upload cover</span>
                            <input 
                                id="cover-image-upload"
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* --- Các field đã được thêm Label --- */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Book Title (*)</label>
                                <input type='text' id="title" name="title" value={formData.title} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                            <div>
                                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN (*)</label>
                                <input type='text' id="isbn" name="isbn" value={formData.isbn} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                             <div>
                                <label htmlFor="authorNames" className="block text-sm font-medium text-gray-700">Author(s), comma-separated (*)</label>
                                <input list="authors-list" id="authorNames" name="authorNames" value={formData.authorNames} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="authors-list">
                                    {authors.map(author => <option key={author._id} value={author.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category (*)</label>
                                <input list="categories-list" id="categoryName" name="categoryName" value={formData.categoryName} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="categories-list">
                                    {categories.map(cat => <option key={cat._id} value={cat.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="publisherName" className="block text-sm font-medium text-gray-700">Publisher (*)</label>
                                <input list="publishers-list" id="publisherName" name="publisherName" value={formData.publisherName} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                                <datalist id="publishers-list">
                                    {publishers.map(pub => <option key={pub._id} value={pub.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (for replacement) (*)</label>
                                <input type='number' id="price" name="price" value={formData.price} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                             <div>
                                <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700">Publication Date</label>
                                <input type='date' id="publication_date" name="publication_date" value={formData.publication_date} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md text-gray-500' />
                            </div>
                             <div>
                                <label htmlFor="page_count" className="block text-sm font-medium text-gray-700">Page Count</label>
                                <input type='number' id="page_count" name="page_count" value={formData.page_count} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (*)</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' rows={4} required></textarea>
                        </div>
                        {/* Nhóm quản lý bản sao */}
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold mb-2">Initial Copies</h4>
                            {initialCopies.map((copy, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder={`Location for Copy #${index + 1} (*)`}
                                        value={copy.location}
                                        onChange={(e) => handleCopyChange(index, e)}
                                        className="w-full px-4 py-2 border rounded-md"
                                        required
                                    />
                                    {initialCopies.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveCopyField(index)} className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200">&times;</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddCopyField} className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md text-sm font-semibold hover:bg-blue-200">Add Another Copy</button>
                        </div>

                      <div className='flex justify-end space-x-4 pt-4'>
                          <button className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300' type='button' onClick={() => dispatch(toggleAddBookPopup())}>Close</button>
                          <button className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800' type='submit'>Add Book</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
);
};

export default AddBookPopup;