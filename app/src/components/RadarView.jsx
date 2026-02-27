import React from 'react';

export default function RadarView({ places, setSelectedPlace, setRadarMode }) {
    // Taking a subset to randomly scatter around the map
    const dots = places.slice(0, 4);

    return (
        <main className="flex flex-1 overflow-hidden h-[calc(100vh-65px)] w-full relative z-20" style={{ background: '#0f1723' }}>
            <aside className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-slate-900/50 flex-col hidden lg:flex h-full">
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold mb-1 text-white">Địa điểm lân cận</h1>
                        <button onClick={() => setRadarMode(false)} className="text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Đang quét xung quanh khu vực</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6 mt-4">
                    {dots.map(place => (
                        <div key={place.id} onClick={() => setSelectedPlace(place)} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary transition-colors cursor-pointer group">
                            <div className="flex gap-4">
                                <div
                                    className="size-16 rounded-lg bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url("${place.image}")` }}
                                ></div>
                                <div className="flex flex-col justify-center text-white text-left">
                                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{place.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">location_on</span> {place.distance}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-yellow-500 text-xs">star</span>
                                        <span className="text-xs font-medium">{place.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <section className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
                <button onClick={() => setRadarMode(false)} className="lg:hidden absolute top-4 left-4 z-50 text-white bg-slate-800 p-2 rounded-full">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>

                <div className="relative size-[300px] sm:size-[500px] md:size-[600px] flex items-center justify-center">
                    <div className="absolute inset-0 border border-primary/20 rounded-full"></div>
                    <div className="absolute inset-[15%] border border-primary/20 rounded-full"></div>
                    <div className="absolute inset-[30%] border border-primary/20 rounded-full"></div>
                    <div className="absolute inset-[45%] border border-primary/20 rounded-full"></div>
                    <div className="absolute w-full h-px bg-primary/10"></div>
                    <div className="absolute h-full w-px bg-primary/10"></div>

                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-transparent opacity-40 radar-line"></div>

                    <div className="absolute top-[20%] left-[30%] group" onClick={() => setSelectedPlace(dots[0])}>
                        <div className="size-4 bg-primary rounded-full glow-dot cursor-pointer transition-transform hover:scale-125"></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{dots[0]?.name}</div>
                    </div>

                    <div className="absolute top-[60%] right-[25%] group" onClick={() => setSelectedPlace(dots[1])}>
                        <div className="size-4 bg-primary rounded-full glow-dot cursor-pointer transition-transform hover:scale-125"></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{dots[1]?.name}</div>
                    </div>

                    <div className="absolute bottom-[20%] left-[45%] group" onClick={() => setSelectedPlace(dots[2])}>
                        <div className="size-3 bg-white/60 rounded-full cursor-pointer transition-transform hover:scale-125 border border-primary"></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{dots[2]?.name}</div>
                    </div>

                    <div className="absolute top-[40%] right-[40%] group" onClick={() => setSelectedPlace(dots[3])}>
                        <div className="size-3 bg-white/60 rounded-full cursor-pointer transition-transform hover:scale-125 border border-primary"></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{dots[3]?.name}</div>
                    </div>

                    <div className="relative z-10 size-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 rounded-full"></div>
                        <div className="size-4 bg-primary rounded-full border-2 border-white shadow-xl shadow-primary/50"></div>
                    </div>
                </div>

                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium tracking-wide uppercase">Hệ thống đang quét...</span>
                    </div>
                </div>
            </section>
        </main>
    );
}
