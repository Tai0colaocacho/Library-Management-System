import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createAuthor, updateAuthor } from "../store/slices/metadataSlice";

const AuthorPopup = ({ closePopup, authorToEdit }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [biography, setBiography] = useState("");

    useEffect(() => {
        if (authorToEdit) {
            setName(authorToEdit.name || "");
            setBiography(authorToEdit.biography || "");
        }
    }, [authorToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const authorData = { name, biography };
        if (authorToEdit) {
            dispatch(updateAuthor({ id: authorToEdit._id, data: authorData }));
        } else {
            dispatch(createAuthor(authorData));
        }
        closePopup();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">{authorToEdit ? "Edit Author" : "Add New Author"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                        <textarea
                            id="biography"
                            rows="4"
                            value={biography}
                            onChange={(e) => setBiography(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closePopup} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{authorToEdit ? "Save Changes" : "Add Author"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthorPopup;