import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBook, fetchAllBooks } from "../store/slices/bookSlice"
import { toggleAddBookPopup } from "../store/slices/popUpSlice";
import { toast } from "react-toastify";
const AddBookPopup = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const handleAddBook = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", title);
    data.append("author", author);
    data.append("description", description);
    data.append("price", price);
    data.append("quantity", quantity);
    dispatch(addBook(data));
    
  }
  return (
      <div className='fixed inset-0 bg-black bg-opacity-50 p-5 flex items-center justify-center z-50'>
        <div className="w-full bg-white rounded-lg shadow-lg md:w-1/3">
          <div className='p-6'>
            <h3 className='text-left font-bold mb-4'>Add Book</h3>
            <form onSubmit={handleAddBook}>
              <div className='mb-4 '>
                <label className='block text-gray-900 font-medium'>Book Title</label>
                <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book's Title" className='w-full px-4 py-2 border-2 border-black rounded-md' required/>           
              </div>
              <div className='mb-4 '>
                <label className='block text-gray-900 font-medium'>Book Author</label>
                <input type='text' value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Book's Author" className='w-full px-4 py-2 border-2 border-black rounded-md' required/>           
              </div>
              <div className='mb-4 '>
                <label className='block text-gray-900 font-medium'>Book Price (Price for borrowing)</label>
                <input type='number' value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Book's Price" className='w-full px-4 py-2 border-2 border-black rounded-md' required/>           
              </div>
              <div className='mb-4 '>
                <label className='block text-gray-900 font-medium'>Book Quantity</label>
                <input type='number' value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Book's Quantities" className='w-full px-4 py-2 border-2 border-black rounded-md' required/>           
              </div>
              <div className='mb-4 '>
                <label className='block text-gray-900 font-medium'>Book Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Book's Description" className='w-full px-4 py-2 border-2 border-black rounded-md' rows = {4}></textarea>           
              </div>
              <div className='flex justify-end space-x-4'>
                <button className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300' type='button' onClick={() => dispatch(toggleAddBookPopup())}>Close</button>
                <button className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800' type='submit'>Add</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
};

export default AddBookPopup;
