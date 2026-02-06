import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      {!isAdminPath && <Header />}
      <main className={`flex-grow ${!isAdminPath ? 'pt-20' : ''}`}>
        {children}
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

export default Layout;