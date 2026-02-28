import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import FavoritesView from './components/FavoritesView';
import RadarView from './components/RadarView';
import DetailModal from './components/DetailModal';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import { db, auth } from './firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [radarMode, setRadarMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  // Auth state
  const [user, setUser] = useLocalStorage('localuni_user', null);
  const [showLogin, setShowLogin] = useState(false);

  // Sync favorites with Firestore when user changes
  useEffect(() => {
    if (user?.uid || user?.email) {
      const uid = user.uid || user.email;
      const unsub = onSnapshot(doc(db, "favorites", uid), (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().list || []);
        } else {
          setFavorites([]);
        }
      });
      return unsub;
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    const unsubPlaces = onSnapshot(collection(db, "places"), (snapshot) => {
      const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllPlaces(placesData);
    });

    const unsubUnis = onSnapshot(collection(db, "universities"), (snapshot) => {
      const unisData = snapshot.docs.map(doc => doc.data().name);
      setUniversities(unisData);
    });

    return () => {
      unsubPlaces();
      unsubUnis();
    };
  }, []);

  const toggleFavorite = async (id) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu quán yêu thích!");
      setShowLogin(true);
      return;
    }
    const newFavs = favorites.includes(id) ? favorites.filter(favId => favId !== id) : [...favorites, id];
    const uid = user.uid || user.email;
    try {
      await setDoc(doc(db, "favorites", uid), { list: newFavs });
    } catch (error) {
      alert("Lỗi lưu yêu thích: " + error.message);
    }
  };

  const pickRandom = () => {
    if (isPicking) return;

    let list = allPlaces;
    if (activeTab === 'favorites') {
      list = allPlaces.filter(p => favorites.includes(p.id));
    }
    if (list.length === 0) {
      alert("Danh sách hiện tại đang trống!");
      return;
    }

    setIsPicking(true);

    // Simulate spinning animation delay
    setTimeout(() => {
      const randomItem = list[Math.floor(Math.random() * list.length)];
      setSelectedPlace(randomItem);
      setIsPicking(false);
    }, 1500);
  };

  const handleLogin = (userData) => {
    setUser({
      email: userData.email,
      uid: userData.uid || userData.email,
      role: userData.email === 'admin@localuni.com' ? 'admin' : 'user'
    });
    setShowLogin(false);
    if (userData.email === 'admin@localuni.com') {
      setActiveTab('admin');
      setRadarMode(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
      <Layout
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setRadarMode(false); }}
        user={user}
        onOpenLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      >
        {!radarMode && activeTab === 'home' && (
          <HomeView
            places={allPlaces}
            universities={universities}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setSelectedPlace={setSelectedPlace}
            setRadarMode={setRadarMode}
          />
        )}

        {!radarMode && activeTab === 'favorites' && (
          <FavoritesView
            places={allPlaces}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setSelectedPlace={setSelectedPlace}
          />
        )}

        {!radarMode && activeTab === 'admin' && user?.role === 'admin' && (
          <AdminPanel
            universities={universities}
            allPlaces={allPlaces}
          />
        )}

        {radarMode && (
          <RadarView
            places={allPlaces}
            setSelectedPlace={setSelectedPlace}
            setRadarMode={setRadarMode}
          />
        )}
      </Layout>

      {selectedPlace && (
        <DetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          user={user}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Floating Randomizer Button */}
      {!radarMode && activeTab !== 'admin' && (
        <button
          onClick={pickRandom}
          disabled={isPicking}
          className="fixed bottom-8 right-8 bg-primary text-white pl-5 pr-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-40 group overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
        >
          <div className={`bg-white/20 p-2 rounded-lg transition-transform duration-1000 ease-in-out ${isPicking ? 'animate-spin' : 'group-hover:rotate-[360deg]'}`}>
            <span className="material-symbols-outlined text-2xl">casino</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">{isPicking ? 'Đang chọn...' : 'Chọn ngẫu nhiên!'}</span>
        </button>
      )}
    </>
  );
}
