import React, { useState } from 'react';
import PlaceCard from './PlaceCard';

export default function HomeView({ places, universities, favorites, toggleFavorite, setSelectedPlace, setRadarMode }) {
    const [activeCategory, setActiveCategory] = useState('Khám phá');
    const [university, setUniversity] = useState('ĐH Quốc gia TP.HCM');
    const [maxPrice, setMaxPrice] = useState(5000000);

    const categories = [
        { id: 'Quán ăn', icon: 'restaurant' },
        { id: 'Dịch vụ', icon: 'home_repair_service' },
        { id: 'Phòng trọ', icon: 'bed' }
    ];

    const filteredPlaces = places.filter(place => {
        const matchesCategory = activeCategory === 'Khám phá' || place.type === activeCategory;
        const matchesUniversity = place.nearUniversities?.some(u => {
            if (typeof u === 'string') return u === university;
            return u.name === university;
        });
        const matchesPrice = place.priceValue !== undefined ? place.priceValue <= maxPrice : true;

        return matchesCategory && matchesUniversity && matchesPrice;
    });

    const formatPrice = (p) => {
        if (p === 0) return '0đ';
        if (p >= 1000000) return (p / 1000000).toFixed(1).replace('.0', '') + 'tr';
        return (p / 1000) + 'k';
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
            {/* Banner Chủ Quán */}
            <div className="w-full bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Bạn là chủ quán? Đưa thông tin lên LocalUni ngay!</p>
                </div>
                <a
                    href="https://zalo.me"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zalo text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                    <div className="size-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-zalo text-[8px] font-black">Zalo</span>
                    </div>
                    Liên hệ ngay
                </a>
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-4 space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Trường Đại học của bạn</label>
                        <div className="relative">
                            <select
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary font-medium bg-none appearance-none"
                            >
                                {universities.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">location_on</span>
                            <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bạn đang tìm gì?</label>
                        <div className="flex h-14 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(activeCategory === cat.id ? 'Khám phá' : cat.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${activeCategory === cat.id
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold'
                                        : 'text-slate-500 hover:text-primary'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                    {cat.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Khoảng giá</label>
                            <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">Dưới {formatPrice(maxPrice)}</span>
                        </div>
                        <div className="pt-6 pb-2 px-2 relative">
                            <input
                                type="range"
                                min="0"
                                max="5000000"
                                step="10000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div className="flex justify-between mt-4 text-xs font-medium text-slate-400">
                                <span>0đ</span>
                                <span>2.5tr</span>
                                <span>5tr</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold">Kết quả tìm kiếm</h2>
                    <p className="text-slate-500 mt-1">Tìm thấy {filteredPlaces.length} địa điểm quanh khu vực của bạn</p>
                </div>
                <div className="inline-flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl self-start">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm font-bold text-slate-900 dark:text-white transition-all">
                        <span className="material-symbols-outlined">grid_view</span>
                        Danh sách
                    </button>
                    <button
                        onClick={() => setRadarMode(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-slate-500 hover:text-primary transition-all"
                    >
                        <span className="material-symbols-outlined">radar</span>
                        Bản đồ Radar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPlaces.length > 0 ? (
                    filteredPlaces.map(place => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            isFavorite={favorites.includes(place.id)}
                            onToggleFavorite={toggleFavorite}
                            onClick={setSelectedPlace}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        Không tìm thấy địa điểm nào phù hợp với bộ lọc hiện tại.
                    </div>
                )}
            </div>
        </main>
    );
}
