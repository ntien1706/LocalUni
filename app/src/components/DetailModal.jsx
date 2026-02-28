import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import fpPromise from '@fingerprintjs/fingerprintjs';

export default function DetailModal({ place, onClose, user }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!place) return;
        const fetchReviews = async () => {
            try {
                const q = query(collection(db, "reviews"), where("placeId", "==", place.id), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setReviews(fetched);
            } catch (err) {
                console.warn("Lỗi tải bình luận:", err);
            }
        };
        fetchReviews();
    }, [place]);

    const submitReview = async () => {
        if (!myReview.trim()) { toast.error("Vui lòng nhập bình luận!"); return; }
        setIsSubmitting(true);
        try {
            // Fingerprint & IP check
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            const ip = ipData.ip;

            const fp = await fpPromise.load();
            const fpResult = await fp.get();
            const deviceId = fpResult.visitorId;

            // Allow 1 review per user per place
            const alreadyReviewed = reviews.some(r => r.userId === user.uid);
            if (alreadyReviewed) {
                toast.error("Bạn đã đánh giá địa điểm này rồi!");
                setIsSubmitting(false);
                return;
            }

            // Limit 2 reviews system-wide per IP / Device to prevent spam
            // Query total reviews by this deviceId
            const sysQuery = query(collection(db, "reviews"), where("deviceId", "==", deviceId));
            const sysSnapshot = await getDocs(sysQuery);
            if (sysSnapshot.size >= 2) {
                toast.error("Thiết bị của bạn đã đạt giới hạn đánh giá (tối đa 2) trên toàn hệ thống!");
                setIsSubmitting(false);
                return;
            }

            const sysQueryIP = query(collection(db, "reviews"), where("ip", "==", ip));
            const sysSnapshotIP = await getDocs(sysQueryIP);
            if (sysSnapshotIP.size >= 2) {
                toast.error("IP của bạn đã đạt giới hạn đánh giá (tối đa 2) trên toàn hệ thống!");
                setIsSubmitting(false);
                return;
            }

            const newReview = {
                placeId: place.id,
                userId: user.uid,
                userEmail: user.email,
                content: myReview.trim(),
                rating,
                deviceId,
                ip,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "reviews"), newReview);

            toast.success("Cảm ơn bạn đã đánh giá!");
            setMyReview('');
            setRating(5);
            setReviews([{ ...newReview, createdAt: { toDate: () => new Date() } }, ...reviews]);
        } catch (error) {
            toast.error("Lỗi đăng bình luận: " + error.message);
        }
        setIsSubmitting(false);
    };

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
                            {place.attributes && place.attributes.length > 0 ? (
                                place.attributes.map((attr, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            <span className="material-symbols-outlined !text-lg">{attr.icon || 'check_circle'}</span>
                                            {attr.name || attr.icon || 'Tiện ích'}
                                        </div>
                                        <p className="text-xs text-slate-500 max-w-[200px]">{attr.description || attr.text || ''}</p>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined !text-lg">wifi</span> Wifi miễn phí
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined !text-lg">ac_unit</span> Máy lạnh
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Đánh giá & Bình luận ({reviews.length})</h3>

                            {user ? (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Đánh giá sao:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <span className={`material-symbols-outlined text-xl ${star <= rating ? 'text-yellow-400 font-bold' : 'text-slate-300 dark:text-slate-600'}`}>star</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        rows="3"
                                        value={myReview}
                                        onChange={e => setMyReview(e.target.value)}
                                        placeholder={`Chia sẻ trải nghiệm của bạn về ${place.name}...`}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary text-sm resize-none text-slate-900 dark:text-white mb-3"
                                    ></textarea>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={submitReview}
                                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl text-center mb-8 border border-blue-100 dark:border-blue-500/20">
                                    <span className="material-symbols-outlined text-blue-500 text-3xl mb-2">lock</span>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Vui lòng đăng nhập để viết đánh giá cho địa điểm này.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-center text-slate-400 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên đánh giá!</p>
                                ) : (
                                    reviews.map((rev, i) => (
                                        <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {(rev.userEmail || "?")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{rev.userEmail}</div>
                                                        <div className="text-[10px] text-slate-400">{rev.createdAt?.toDate ? rev.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined !text-[12px] text-yellow-500 font-bold">star</span>
                                                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{rev.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{rev.content}</p>
                                        </div>
                                    ))
                                )}
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
