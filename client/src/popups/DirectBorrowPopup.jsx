import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { directBorrowBook } from "../store/slices/borrowSlice";
import { BookUp } from "lucide-react";

const DirectBorrowPopup = ({ closePopup }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.borrow);
    const [memberEmail, setMemberEmail] = useState("");
    const [bookIsbn, setBookIsbn] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(directBorrowBook({ memberEmail, bookIsbn })).then((result) => {
            if (result.payload.success) {
                closePopup();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <BookUp className="text-indigo-600" size={28}/>
                    <h2 className="text-xl font-bold text-gray-800">Direct Borrow at Counter</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">Member's Email</label>
                        <input
                            type="email"
                            id="memberEmail"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                            placeholder="example@email.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="bookIsbn" className="block text-sm font-medium text-gray-700 mb-1">Book ISBN</label>
                        <input
                            type="text"
                            id="bookIsbn"
                            value={bookIsbn}
                            onChange={(e) => setBookIsbn(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                            placeholder="978-3-16-148410-0"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closePopup} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                            {loading ? "Processing..." : "Confirm Borrow"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DirectBorrowPopup;