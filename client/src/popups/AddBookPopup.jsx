import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBook } from "../store/slices/bookSlice";
import { toggleAddBookPopup } from "../store/slices/popUpSlice";

const AddBookPopup = () => {
  const dispatch = useDispatch();
  const { authors, categories, publishers } = useSelector(state => state.metadata);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    authorIds: [], 
    categoryId: "",  
    publisherId: "", 
    description: "",
    publication_date: "",
    page_count: "",
    price: ""
  });

  const [initialCopies, setInitialCopies] = useState([{ location: "", status: "Available" }]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (e) => {
      const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, authorIds: selectedIds }));
  };

  const handleCopyChange = (index, event) => {
    const values = [...initialCopies];
    values[index].location = event.target.value;
    setInitialCopies(values);
  };

  const handleAddCopyField = () => {
    setInitialCopies([...initialCopies, { location: "", status: "Available" }]);
  };

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

  const handleAddBook = (e) => {
    e.preventDefault();
    const bookData = new FormData();
    
    for (const key in formData) {
      if (key !== "authorIds" && key !== "categoryId" && key !== "publisherId") {
        bookData.append(key, formData[key] || '');
      }
    }

    formData.authorIds.forEach(id => bookData.append("authors", id)); 
    
    bookData.append("categoryId", formData.categoryId);
    bookData.append("publisherId", formData.publisherId);

    const validCopies = initialCopies.filter(copy => copy.location.trim());
    bookData.append("initialCopies", JSON.stringify(validCopies));
    
    if (coverImage) {
        bookData.append("coverImage", coverImage);
    }

    dispatch(addBook(bookData));
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
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Book Title (*)</label>
                                <input type='text' id="title" name="title" value={formData.title} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                            <div>
                                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN (*)</label>
                                <input type='text' id="isbn" name="isbn" value={formData.isbn} onChange={handleFormChange} className='mt-1 w-full px-4 py-2 border rounded-md' required />
                            </div>
                             <div>
                                <label htmlFor="authorIds" className="block text-sm font-medium text-gray-700">Author(s) (*)</label>
                                <select
                                    id="authorIds"
                                    name="authorIds"
                                    multiple={true} 
                                    value={formData.authorIds}
                                    onChange={handleAuthorChange}
                                    className='mt-1 w-full px-4 py-2 border rounded-md h-24' 
                                    required
                                >
                                    {authors.map(author => <option key={author._id} value={author._id}>{author.name}</option>)}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple authors.</p>
                            </div>
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category (*)</label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleFormChange}
                                    className='mt-1 w-full px-4 py-2 border rounded-md'
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="publisherId" className="block text-sm font-medium text-gray-700">Publisher (*)</label>
                                <select
                                    id="publisherId"
                                    name="publisherId"
                                    value={formData.publisherId}
                                    onChange={handleFormChange}
                                    className='mt-1 w-full px-4 py-2 border rounded-md'
                                    required
                                >
                                    <option value="">Select a publisher</option>
                                    {publishers.map(pub => <option key={pub._id} value={pub._id}>{pub.name}</option>)}
                                </select>
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