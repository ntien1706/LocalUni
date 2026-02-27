import React, { useState } from 'react';

export default function DetailModal({ place, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!place) return null;

    const images = place.images && place.images.length > 0 ? place.images : [place.image];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[70] size-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="overflow-y-auto hide-scrollbar flex-1 pb-20 sm:pb-0">
                    <div className="relative w-full aspect-video group bg-slate-100 dark:bg-slate-800">
                        <img className="w-full h-full object-cover transition-opacity duration-300" src={images[currentImageIndex]} alt={place.name} />

                        {images.length > 1 && (
                            <>
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={prevImage} className="size-10 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shadow-lg text-primary hover:bg-white transition-colors">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button onClick={nextImage} className="size-10 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shadow-lg text-primary hover:bg-white transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, idx) => (
                                        <div key={idx} className={`size-2 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}></div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <div className="flex items-start justify-between">
                                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{place.name}</h2>
                                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-yellow-700 dark:text-yellow-400 font-bold text-sm shrink-0 ml-2">
                                    <span className="material-symbols-outlined !text-sm">star</span>
                                    <span>{place.rating}</span>
                                </div>
                            </div>
                            <a
                                href={place.mapsLink || `https://maps.google.com/?q=${encodeURIComponent(place.location || place.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center mt-2 text-primary group cursor-pointer inline-flex"
                            >
                                <span className="material-symbols-outlined text-base mr-1">location_on</span>
                                <span className="text-sm font-medium underline underline-offset-4">{place.address || place.location}</span>
                                <span className="material-symbols-outlined text-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                            </a>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mô tả</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                                {place.description || "Chưa có mô tả chi tiết cho địa điểm này."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span className="material-symbols-outlined !text-lg">wifi</span> Wifi miễn phí
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span className="material-symbols-outlined !text-lg">ac_unit</span> Máy lạnh
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 gap-4 sticky bottom-0">
                    <a
                        href={`tel:${place.phone?.replace(/\s/g, '') || ''}`}
                        className="flex items-center justify-center gap-2 h-14 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                        <span className="material-symbols-outlined text-primary">call</span>
                        <span className="text-sm sm:text-base">{place.phone || "Gọi điện"}</span>
                    </a>
                    <a
                        href={place.zaloLink || `https://zalo.me/${place.phone?.replace(/\s/g, '') || ''}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 h-14 bg-zalo text-white rounded-xl font-bold transition-all hover:brightness-110 shadow-lg shadow-zalo/20"
                    >
                        <div className="size-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
                            <span className="text-zalo text-[10px] font-black">Zalo</span>
                        </div>
                        <span className="text-sm sm:text-base">Nhắn tin Zalo</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
