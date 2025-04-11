import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './apps/header/header';
import Menu from './apps/menu/Menu';
import Work from './apps/main/work';
import { FullPost } from './apps/fullpost/FullPost';
import { Mobile } from './apps/menu/menu-mob';
import Dock from "./apps/menu/dock";
import Profile from './account/account';
import Chat from './apps/tools/chat';
import Login from "./apps/setup/Login";
import RegistrationForm from "./apps/setup/Registration";
import { fetchAuthMe } from "./redux/slices/auth";
import { useDispatch } from 'react-redux';
import PrimarySearchAppBar from './apps/tools/library';
import AdminPanel from './apps/tools/admin';
import ProfileEdit from './apps/edit-account/edit';
import MiniApps from './apps/mini-apps/mini-apps'; // Импортируем компонент MiniApps
import SurveyForm from './apps/mini-apps/application/form';

const AppRouter = () => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchAuthMe());
    
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);
      setIsMobile(isMobileDevice || isTablet);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [dispatch]);

  return (
    <div className="app-container">
      <Routes>
        {/* Маршруты без хедера */}
        <Route path="/library" element={<PrimarySearchAppBar />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dock" element={<Dock />} />
        <Route path="/apps/atomform" element={<SurveyForm />} />


        {/* Маршруты с хедером */}
        <Route 
          path="/*" 
          element={
            <>
              <Header />
              {isMobile && <Mobile />}
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="flex-container">
                      <Menu />
                      <Work />
                    </div>
                  }
                />
                <Route
                  path="/mini-apps"
                  element={
                    <div className="flex-container">
                      <Menu />
                      <MiniApps />
                    </div>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/posts/:id" element={<FullPost />} />
                <Route path="/account/profile/:id?" element={<Profile />} />
                <Route path="/edit-profile/:id" element={<ProfileEdit />} />
              </Routes>
            </>
          } 
        />
      </Routes>
    </div>
  );
};

export default AppRouter;