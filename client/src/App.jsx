import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTP from './pages/OTP';
import ResetPassword from './pages/ResetPassword';
import BookDetails from './pages/BookDetails';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { fetchAllUsers } from "./store/slices/userSlice";
import { fetchAllBooks } from "./store/slices/bookSlice";
import { fetchAllBorrowedBooks, fetchUserBorrowedBooks } from "./store/slices/borrowSlice";
import { fetchAllMetadata } from "./store/slices/metadataSlice";
import { fetchNotifications } from "./store/slices/notificationSlice";

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
    if (isAuthenticated) {
      dispatch(fetchAllBooks());
      dispatch(fetchNotifications());
      if (user?.role === "User") {
        dispatch(fetchUserBorrowedBooks());
      }
      if (user?.role === "Admin") {
        dispatch(fetchAllUsers());
        dispatch(fetchAllBorrowedBooks());
        dispatch(fetchAllMetadata());
      }
    }
  }, [isAuthenticated, user?.role, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/password/forgot' element={<ForgotPassword />} />
        <Route path='/otp-verification/:email' element={<OTP />} />
        <Route path='/password/reset/:token' element={<ResetPassword />} />
        {/* <Route path='/books/:id' element={<BookDetails />} /> */}
      </Routes>
      <ToastContainer theme='dark' />
    </Router>
  );
};

export default App;
