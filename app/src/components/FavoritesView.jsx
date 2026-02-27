import React, { useState } from 'react';
import PlaceCard from './PlaceCard';

export default function FavoritesView({ places, favorites, toggleFavorite, setSelectedPlace }) {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const favoritePlaces = places.filter(p => favorites.includes(p.id));
    const displayedPlaces = favoritePlaces.filter(p =>
        activeCategory === 'Tất cả' || p.type === activeCategory
    );

    return (
        <main className="max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
            <div className="mb-8">
                <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight mb-2">Danh sách yêu thích</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Quản lý các địa điểm và dịch vụ bạn đã lưu lại cho kỳ học này.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2">
                {['Tất cả', 'Quán ăn', 'Phòng trọ', 'Dịch vụ'].map(cat => {
                    const isActive = activeCategory === cat;
                    const icon = cat === 'Tất cả' ? 'grid_view' : cat === 'Quán ăn' ? 'restaurant' : cat === 'Phòng trọ' ? 'home_work' : 'local_laundry_service';
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                            {cat}
                        </button>
                    )
                })}
            </div>

            {displayedPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedPlaces.map(place => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            isFavorite={true}
                            onToggleFavorite={toggleFavorite}
                            onClick={setSelectedPlace}
                        />
                    ))}
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-3xl">heart_broken</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">Chưa có mục nào</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">Hãy tìm kiếm và nhấn tim để lưu địa điểm mới</p>
                </div>
            )}
        </main>
    );
}
