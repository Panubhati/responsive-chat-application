import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import List from './components/list/List';
import Chat from './components/chat/Chat';
import Detail from './components/detail/Detail';
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userStore';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };

  }, [fetchUserInfo]);

  if (isLoading) return <div className='loading'>Loading...</div>;

  return (
    <Router>
      <div className='container'>
        {currentUser ? ( // Use currentUser to check authentication
          <>
            <Routes>
              <Route path="/" element={<List />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/detail" element={<Detail />} />
            </Routes>
          </>
        ) : (
          <Login />
        )}
        <Notification />
      </div>
    </Router>
  );
};

export default App;
