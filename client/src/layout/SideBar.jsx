import {useEffect} from "react";
import logo_with_title from "../assets/logo-with-title.png";
import logoutIcon from "../assets/logout.png";
import closeIcon from "../assets/white-close-icon.png";
import dashboardIcon from "../assets/element.png";
import bookIcon from "../assets/book.png";
import catalogIcon from "../assets/catalog.png";
import settingIcon from "../assets/setting-white.png";
import usersIcon from "../assets/people.png";
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {logout, resetAuthSlice} from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { toggleSettingPopup } from "../store/slices/popUpSlice";
import SettingPopup from "../popups/SettingPopup"; 
import { IoSettingsSharp } from "react-icons/io5";
import { User } from "lucide-react";

const SideBar = ({ isSideBarOpen, setIsSideBarOpen, setSelectedComponent }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addNewAdminPopup, settingPopup } = useSelector((state) => state.popup);
 
  const { loading, error, message, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, isAuthenticated, error, loading, message]);

  const isAdmin = isAuthenticated && user?.role === "Admin";
  const isLibrarian = isAuthenticated && user?.role === "Librarian";
  const isMember = isAuthenticated && user?.role === "Member";
    
  return (
    <>
        <aside
            className={`${
                isSideBarOpen ? "left-0" : "-left-full"
                } z-10 transition-all duration-700 md:relative md:left-0 flex w-64 bg-black text-white flex-col h-full`}
            style={{ position: "fixed" }}
        >
          {/* ... Logo ... */}
          <div className="px-6 py-4 my-8">
              <img src={logo_with_title} alt="logo" />
          </div>
          <nav className="flex-1 px-6 space-y-2">
              <button
                    onClick={() => setSelectedComponent("Profile")}
                    className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2"
                >
                    <User className="w-6 h-6"/> <span>My Profile</span>
                </button>
            {(isAdmin || isLibrarian) && (
              <>
                <button onClick={() => setSelectedComponent("Dashboard")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={dashboardIcon} alt="dashboard" /> <span>Dashboard</span>
                </button>
                <button onClick={() => setSelectedComponent("Books")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={bookIcon} alt="books" /> <span>Book Management</span>
                </button>
                <button onClick={() => setSelectedComponent("Catalog")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={catalogIcon} alt="catalog" /> <span>Catalog</span>
                </button>
                 <button onClick={() => setSelectedComponent("Users")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={usersIcon} alt="users" /> <span>Users</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button onClick={() => setSelectedComponent("Settings")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                    <IoSettingsSharp className="w-6 h-6" /> <span>Settings</span>
                </button>
              </>
            )}

            {isMember && (
              <>
                <button onClick={() => setSelectedComponent("Dashboard")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={dashboardIcon} alt="dashboard" /> <span>Dashboard</span>
                </button>
                 <button onClick={() => setSelectedComponent("Books")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={bookIcon} alt="books" /> <span>Browse Books</span>
                </button>
                <button onClick={() => setSelectedComponent("My Books")} className="w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
                  <img src={catalogIcon} alt="my-books" />{" "}
                  <span>My Books</span> 
                </button>
              </>
            )}

            <button onClick={() => dispatch(toggleSettingPopup())} className="md:hidden w-full py-2 font-medium bg-transparent rounded-md hover:cursor-pointer flex items-center space-x-2">
              <img src={settingIcon} alt="setting" />{" "}
              <span>Update Credentials</span>
            </button>
          </nav>

          <div className="px-6 py-4">
              <button
                  className="py-2 font-medium text-center bg-transparent rounded-md hover:cursor-pointer flex items-center justify-center space-x-5 mb-7 mx-auto w-fit"
                  onClick={handleLogout}
              >
                  <img src={logoutIcon} alt="logout" /> <span>Log Out</span>
              </button>
          </div>
          <img
              src={closeIcon}
              alt="closeIcon"
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
              className="h-fit w-fit absolute top-0 right-4 mt-4 block md:hidden"
          />
        </aside>
        {settingPopup && <SettingPopup />}
  </>
);
};


export default SideBar;
