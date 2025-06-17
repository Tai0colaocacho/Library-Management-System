import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../layout/Header";
import { Edit, UserPlus } from "lucide-react";
import EditUserPopup from "../popups/EditUserPopup";
import AddStaffPopup from "../popups/AddStaffPopup"; 
import { fetchAllUsers } from "../store/slices/userSlice";

const Users = () => {
  const dispatch = useDispatch();
  const { users } = useSelector(state => state.user);

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddStaffPopupOpen, setIsAddStaffPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openEditPopup = (user) => {
    setSelectedUser(user);
    setIsEditPopupOpen(true);
  };

  const closePopups = () => {
    setIsEditPopupOpen(false);
    setIsAddStaffPopupOpen(false);
    setSelectedUser(null);
    dispatch(fetchAllUsers());
  };

  return (
    <>
      <main className="relative flex-1 p-6 pt-28 ">
        <Header />
        <header className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <h2 className="text-xl font-medium md:text-2xl md:font-semibold ">Registered Users</h2>
          <button
            onClick={() => setIsAddStaffPopupOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <UserPlus size={20} />
            Add Staff Member
          </button>
        </header>
        
        <div className="mt-6 overflow-auto bg-white rounded-md shadow-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books Borrowed</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">{user.borrowedBooks?.length || 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditPopup(user)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <h3 className="text-xl mt-5 font-medium text-center">No registered users found.</h3>}
      </main>

      {isEditPopupOpen && <EditUserPopup user={selectedUser} closePopup={closePopups} />}
      {isAddStaffPopupOpen && <AddStaffPopup closePopup={closePopups} />}
    </>
  );
};

export default Users;