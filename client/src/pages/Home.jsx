import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Sidebar from "../layout/SideBar";
import UserDashboard from "../components/UserDashboard";
import AdminDashboard from "../components/AdminDashboard";
import BookManagement from "../components/BookManagement";
import Catalog from "../components/Catalog";
import Users from "../components/Users";
import Settings from "../components/Settings";
import ProfilePage from "../components/ProfilePage";
import MyBooks from "../components/MyBooks";
import MetadataManagement from "../components/MetadataManagement";
const Home = () => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("");

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
  
  return (
    <>
      <div className="relative md:pl-64 flex min-h-screen bg-gray-100">
        <div className="md:hidden z-10 absolute right-6 top-4 sm:top-6 flex justify-center items-center bg-black round-md h-9 w-9 text-white">
          <GiHamburgerMenu
            className="text-2xl"
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          />
        </div>
        <Sidebar
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
          setSelectedComponent={setSelectedComponent}
        />
        {(() => {
          switch (selectedComponent) {
            case "Profile":
                return <ProfilePage />;
            case "Dashboard":
              return user?.role === "Member" ? (
                <UserDashboard />
              ) : (
                <AdminDashboard />
              );
            case "Books":
              return <BookManagement />;
            case "Catalog":
              if (user.role === "Admin" || user.role === "Librarian") {
                return <Catalog />;
              }
              break;
            case "Users":
              if (user.role === "Admin" || user.role === "Librarian") {
                return <Users />;
              }
                  break;
                  case "Metadata":
              if (user.role === "Admin" || user.role === "Librarian") {
                return <MetadataManagement />;
              }
              break;
            case "Settings":
              if (user.role === "Admin") {
                return <Settings />;
              }
              break;
              case "My Books":
                return <MyBooks />;
            default:
              return user?.role === "Member" ? (
                <UserDashboard />
              ) : (
                <AdminDashboard />
              );
          }
        })()}
      </div>
    </>
  );
};

export default Home;
