import React, { useState } from 'react';

export default function AdminPanel({ universities, setUniversities, allPlaces, setAllPlaces }) {
    const [activeTab, setActiveTab] = useState('places_form');
    const [newUni, setNewUni] = useState('');

    const availableIcons = [
        { id: 'wifi', label: 'Wifi' },
        { id: 'ac_unit', label: 'Máy lạnh' },
        { id: 'local_parking', label: 'Bãi đỗ xe' },
        { id: 'restaurant', label: 'Ăn uống' },
        { id: 'pets', label: 'Thú cưng' },
        { id: 'electrical_services', label: 'Ổ điện' }
    ];

    // Form states
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [type, setType] = useState('Quán ăn');
    const [rating, setRating] = useState('5.0');
    const [locationStr, setLocationStr] = useState('');
    const [priceStr, setPriceStr] = useState('');
    const [priceValue, setPriceValue] = useState(0);
    const [selectedUnis, setSelectedUnis] = useState([]); // Array of { name, distance }
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState('Đang mở cửa');
    const [statusColor, setStatusColor] = useState('bg-green-500');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [mapsLink, setMapsLink] = useState('');
    const [attributes, setAttributes] = useState([]);

    // --- Universities ---
    const handleAddUni = (e) => {
        e.preventDefault();
        if (newUni.trim() && !universities.includes(newUni.trim())) {
            setUniversities([...universities, newUni.trim()]);
            setNewUni('');
        }
    };

    const handleDeleteUni = (uni) => {
        setUniversities(universities.filter(u => u !== uni));
    };

    // --- Media ---
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (idx) => {
        setImages(images.filter((_, i) => i !== idx));
    };

    // --- Unis selection logic ---
    const toggleUniSelection = (uniName) => {
        if (selectedUnis.find(u => u.name === uniName)) {
            setSelectedUnis(selectedUnis.filter(u => u.name !== uniName));
        } else {
            setSelectedUnis([...selectedUnis, { name: uniName, distance: '' }]);
        }
    };

    const updateUniDistance = (uniName, value) => {
        setSelectedUnis(selectedUnis.map(u => u.name === uniName ? { ...u, distance: value } : u));
    };

    // --- Attributes logic ---
    const addAttribute = () => {
        setAttributes([...attributes, { icon: 'wifi', text: 'Tính năng mới' }]);
    };
    const updateAttribute = (index, field, value) => {
        const newAttrs = [...attributes];
        newAttrs[index][field] = value;
        setAttributes(newAttrs);
    };
    const removeAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    // --- Submitting Form ---
    const handleSubmitPlace = (e) => {
        e.preventDefault();

        let categoryIcon = 'restaurant';
        if (type === 'Dịch vụ') categoryIcon = 'home_repair_service';
        if (type === 'Phòng trọ') categoryIcon = 'bed';

        const placeData = {
            id: editingId || Date.now(),
            name,
            type,
            categoryIcon,
            rating: parseFloat(rating),
            location: locationStr,
            price: priceStr,
            priceValue: Number(priceValue) || 0,
            nearUniversities: selectedUnis,
            images: images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"],
            image: images.length > 0 ? images[0] : "https://placehold.co/600x400?text=No+Image",
            status,
            statusColor,
            description,
            phone,
            zaloLink: phone ? `https://zalo.me/${phone.replace(/\s/g, '')}` : '',
            mapsLink,
            attributes: attributes.length > 0 ? attributes : null
        };

        if (editingId) {
            setAllPlaces(allPlaces.map(p => p.id === editingId ? placeData : p));
            alert("Cập nhật thông tin thành công!");
            setActiveTab('manage_places');
        } else {
            setAllPlaces([placeData, ...allPlaces]);
            alert("Thêm địa điểm thành công!");
            resetForm();
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setType('Quán ăn');
        setLocationStr('');
        setPriceStr('');
        setPriceValue(0);
        setSelectedUnis([]);
        setImages([]);
        setDescription('');
        setPhone('');
        setMapsLink('');
        setAttributes([]);
        setRating('5.0');
    };

    // --- Managing places ---
    const startEditing = (place) => {
        setEditingId(place.id);
        setName(place.name || '');
        setType(place.type || 'Quán ăn');
        setRating(place.rating ? String(place.rating) : '5.0');
        setLocationStr(place.location || '');
        setPriceStr(place.price || '');
        setPriceValue(place.priceValue || 0);

        const mappedUnis = (place.nearUniversities || []).map(u => {
            if (typeof u === 'string') return { name: u, distance: '' };
            return u;
        });
        setSelectedUnis(mappedUnis);

        setImages(place.images || [place.image].filter(Boolean) || []);
        setDescription(place.description || '');
        setPhone(place.phone || '');
        setMapsLink(place.mapsLink || '');
        setAttributes(place.attributes || []);

        setActiveTab('places_form');
    };

    const deletePlace = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa điểm này không? Hành động không thể hoàn tác.")) {
            setAllPlaces(allPlaces.filter(p => p.id !== id));
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
            <div className="mb-8">
                <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight mb-2">Admin Panel</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Hệ thống quản trị cơ sở dữ liệu LocalUni.</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={() => { resetForm(); setActiveTab('places_form'); }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'places_form' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <span className="material-symbols-outlined align-middle mr-2 text-[20px]">add_business</span>
                    Thêm Quán/Trọ mới
                </button>
                <button
                    onClick={() => setActiveTab('manage_places')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'manage_places' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <span className="material-symbols-outlined align-middle mr-2 text-[20px]">manage_search</span>
                    Quản lý các Quán/Trọ hiện tại
                </button>
                <button
                    onClick={() => setActiveTab('universities')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'universities' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    <span className="material-symbols-outlined align-middle mr-2 text-[20px]">location_city</span>
                    Quản lý Trường học
                </button>
            </div>

            {activeTab === 'universities' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h2 className="text-2xl font-bold mb-6">Danh sách Trường Đại học</h2>
                    <form onSubmit={handleAddUni} className="flex gap-4 mb-8">
                        <input
                            type="text"
                            value={newUni}
                            onChange={(e) => setNewUni(e.target.value)}
                            placeholder="Nhập tên trường mới..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                        />
                        <button type="submit" className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined">add</span> Thêm mới
                        </button>
                    </form>

                    <div className="space-y-3">
                        {universities.map(uni => (
                            <div key={uni} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{uni}</span>
                                <button
                                    onClick={() => handleDeleteUni(uni)}
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'manage_places' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h2 className="text-2xl font-bold mb-6">Quản lý các Quán/Trọ hiện tại</h2>
                    <div className="space-y-4">
                        {allPlaces.length === 0 ? (
                            <p className="text-slate-500">Chưa có dữ liệu nào trong hệ thống.</p>
                        ) : (
                            allPlaces.map(place => (
                                <div key={place.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <img src={place.image} alt="thumb" className="w-full sm:w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600 shrink-0" />
                                    <div className="flex-1 w-full text-center sm:text-left">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{place.name}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1 flex items-center justify-center sm:justify-start gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {place.location}
                                        </p>
                                        <div className="text-primary font-bold mt-1 text-sm">{place.price}</div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => startEditing(place)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg font-bold transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => deletePlace(place.id)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg font-bold transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'places_form' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{editingId ? 'Chỉnh sửa Thông tin' : 'Thêm Địa điểm Mới'}</h2>
                        {editingId && (
                            <button onClick={() => { resetForm(); setActiveTab('manage_places'); }} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium">Hủy chỉnh sửa</button>
                        )}
                    </div>

                    <form onSubmit={handleSubmitPlace} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ảnh Gallery (Có thể chọn nhiều)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all dark:file:bg-primary/20 dark:file:text-blue-300"
                            />
                            {images.length > 0 && (
                                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group shrink-0">
                                            <img src={img} alt="preview" className="h-28 w-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tên địa điểm</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Danh mục</label>
                                    <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none appearance-none text-slate-900 dark:text-white">
                                        <option>Quán ăn</option>
                                        <option>Dịch vụ</option>
                                        <option>Phòng trọ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Đánh giá sao</label>
                                    <input type="text" value={rating} onChange={e => setRating(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Universites Multi-Select Container with Distance Inputs */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                                Liên kết với Trường Đại học sinh viên (Nhấn để báo cáo khoảng cách)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {universities.map(uni => {
                                    const isSelected = selectedUnis.find(u => u.name === uni);
                                    return (
                                        <button
                                            key={uni}
                                            type="button"
                                            onClick={() => toggleUniSelection(uni)}
                                            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'}`}
                                        >
                                            <span className="material-symbols-outlined align-bottom mr-1 text-[16px]">{isSelected ? 'check' : 'add'}</span>
                                            {uni}
                                        </button>
                                    )
                                })}
                            </div>

                            {selectedUnis.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedUnis.map(su => (
                                        <div key={su.name} className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{su.name}</span>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Cách bao xa? VD: 500m"
                                                    value={su.distance}
                                                    onChange={e => updateUniDistance(su.name, e.target.value)}
                                                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Giá hiển thị (VD: 25k - 45k)</label>
                                <input type="text" value={priceStr} onChange={e => setPriceStr(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Giá trị cao nhất (VNĐ) để vào bộ lọc Slider</label>
                                <input type="number" value={priceValue} onChange={e => setPriceValue(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại (Bắt buộc để gọi và lập link Zalo)</label>
                                <input type="tel" placeholder="0123456789" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                                <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ tự nhận diện số này và trỏ về <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">zalo.me/sđt</code>.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Link xuất phát Google Maps</label>
                                <input type="url" value={mapsLink} onChange={e => setMapsLink(e.target.value)} placeholder="https://maps.google.com/?q=..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ quán/trọ (vị trí ngắn gọn cho Card)</label>
                            <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)} placeholder="Số 10, Làng Đại học..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả đầy đủ chi tiết</label>
                            <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none resize-none text-slate-900 dark:text-white"></textarea>
                        </div>

                        {/* Feature/Attributes Note Builder */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Ghi chú & Tiện ích (Hiển thị trong Modal)</label>
                                <button type="button" onClick={addAttribute} className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">add</span> Thêm tiện ích
                                </button>
                            </div>

                            <div className="space-y-3">
                                {attributes.map((attr, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <select
                                            value={attr.icon}
                                            onChange={(e) => updateAttribute(idx, 'icon', e.target.value)}
                                            className="w-16 sm:w-32 px-2 sm:px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white font-medium"
                                        >
                                            {availableIcons.map(ic => <option key={ic.id} value={ic.id}>{ic.label}</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            value={attr.text}
                                            onChange={e => updateAttribute(idx, 'text', e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                            placeholder="Ghi chú (VD: Wifi miễn phí cực mạnh)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(idx)}
                                            className="px-3 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all shrink-0"
                                        >
                                            <span className="material-symbols-outlined align-middle">delete</span>
                                        </button>
                                    </div>
                                ))}
                                {attributes.length === 0 && (
                                    <p className="text-sm text-slate-400">Không có tiện ích nào đang được cấu hình. (Hệ thống sẽ hiển thị mặc định Wifi/Máy lạnh nếu trường này trống).</p>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg shadow-primary/30 flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined">{editingId ? 'save' : 'publish'}</span>
                            {editingId ? 'Lưu Thông Tin Mới' : 'Đăng Tải Địa Điểm'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
