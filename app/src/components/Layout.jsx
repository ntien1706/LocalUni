import React, { useState } from 'react';

export default function Layout({ children, activeTab, setActiveTab, user, onOpenLogin, onLogout }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-10 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-primary cursor-pointer">
                            <div className="bg-primary p-2 rounded-lg text-white md:hidden lg:block lg:bg-transparent lg:p-0 lg:text-primary">
                                <span className="material-symbols-outlined text-3xl font-bold">school</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight hidden md:block">Local<span className="text-primary">Uni</span></h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <button
                                onClick={() => setActiveTab('home')}
                                className={`text-sm font-semibold transition-colors ${activeTab === 'home'
                                    ? 'text-primary border-b-2 border-primary pb-1'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                    }`}
                            >
                                Khám phá
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`text-sm font-semibold transition-colors ${activeTab === 'favorites'
                                    ? 'text-primary border-b-2 border-primary pb-1'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                    }`}
                            >
                                Yêu thích
                            </button>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setActiveTab('admin')}
                                    className={`text-sm font-semibold transition-colors ${activeTab === 'admin'
                                        ? 'text-primary border-b-2 border-primary pb-1'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                        }`}
                                >
                                    Quản trị Admin
                                </button>
                            )}
                        </nav>
                    </div>
                    <div className="flex flex-1 justify-end items-center gap-4">
                        <label className="hidden sm:flex items-center relative w-full max-w-xs">
                            <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm địa điểm..."
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                            />
                        </label>
                        {user ? (
                            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-center p-1 rounded-full border border-red-200 hover:bg-red-50 text-red-500 transition-colors tooltip" title="Đăng xuất">
                                <div className="size-8 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm font-bold">logout</span>
                                </div>
                            </button>
                        ) : (
                            <button onClick={onOpenLogin} className="flex items-center justify-center p-1 rounded-full border-2 border-primary/20 hover:bg-primary/10 transition-colors">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {children}

            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-10 py-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex flex-col gap-4 max-w-xs">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-2xl font-bold">school</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-extrabold">LocalUni</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Nền tảng giúp sinh viên tìm kiếm phòng trọ, quán ăn và các dịch vụ quanh trường đại học nhanh chóng và tin cậy.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div className="flex flex-col gap-3">
                            <h4 className="text-slate-900 dark:text-white font-bold text-sm">Tính năng</h4>
                            <a href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary">Khám phá</a>
                            <a href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary">Tìm phòng trọ</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h4 className="text-slate-900 dark:text-white font-bold text-sm">Hỗ trợ</h4>
                            <a href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:text-primary">Liên hệ</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs">© 2026 LocalUni. Mọi quyền được bảo lưu.</p>
                </div>
            </footer>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 text-center">
                        <div className="flex justify-center mb-4 text-red-500">
                            <span className="material-symbols-outlined text-5xl">logout</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Xác nhận đăng xuất</h3>
                        <p className="text-slate-500 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống LocalUni không?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => { onLogout(); setShowLogoutConfirm(false); }}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
