import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createPublisher, updatePublisher } from "../store/slices/metadataSlice";

const PublisherPopup = ({ closePopup, publisherToEdit }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact_email, setContactEmail] = useState("");

    useEffect(() => {
        if (publisherToEdit) {
            setName(publisherToEdit.name || "");
            setAddress(publisherToEdit.address || "");
            setContactEmail(publisherToEdit.contact_email || "");
        }
    }, [publisherToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const publisherData = { name, address, contact_email };
        if (publisherToEdit) {
            dispatch(updatePublisher({ id: publisherToEdit._id, data: publisherData }));
        } else {
            dispatch(createPublisher(publisherData));
        }
        closePopup();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">{publisherToEdit ? "Edit Publisher" : "Add New Publisher"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                        <input
                            type="email"
                            id="contact_email"
                            value={contact_email}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closePopup} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{publisherToEdit ? "Save Changes" : "Add Publisher"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublisherPopup;