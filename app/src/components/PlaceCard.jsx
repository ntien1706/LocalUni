import React from 'react';

export default function PlaceCard({ place, isFavorite, onToggleFavorite, onClick }) {
    const uniList = place.nearUniversities || [];
    return (
        <div
            className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => onClick(place)}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={place.image}
                    alt={place.name}
                />
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(place.id); }}
                    className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                >
                    <span className={`material-symbols-outlined ${isFavorite ? "fill text-red-500" : ""}`}>favorite</span>
                </button>
                {place.status && (
                    <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full ${place.statusColor || 'bg-primary'} text-white text-xs font-bold`}>
                        {place.status}
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{place.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 ml-2 shrink-0">
                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                        <span className="text-sm font-bold">{place.rating}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span className="truncate">{place.location}</span>
                </p>
                {uniList.length > 0 && (
                    <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-1">
                        {uniList.map((u, i) => {
                            const isObj = typeof u === 'object';
                            const name = isObj ? u.name : u;
                            const dist = isObj && u.distance ? ` - ${u.distance}` : '';
                            return (
                                <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold max-w-full">
                                    <span className="material-symbols-outlined text-[12px] mr-1 shrink-0">school</span>
                                    <span className="truncate">{name}{dist}</span>
                                </span>
                            );
                        })}
                    </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-primary font-bold text-sm">{place.price}</span>
                </div>
            </div>
        </div>
    );
}
