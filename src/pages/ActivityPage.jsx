import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    SportsSoccer,
    Sports,
    Place,
    Search
} from '@mui/icons-material';

function ActivityPage() {
    const [keyword, setKeyword] = useState('');
    const [venues, setVenues] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVenues('');
    }, []);

    const fetchVenues = async (kw) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7001/activity/search?keyword=${kw}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setVenues(data.data);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('获取场馆失败');
        }
    };

    // const handleSearch = (e) => {
    //     e.preventDefault();
    //     fetchVenues(keyword);
    // };

    const handleClickVenue = (vid) => {
        navigate(`/venue/${vid}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <SportsSoccer className="mr-2" /> 活动报名
                </h1>
                <div className="relative w-1/2">
                    <input
                        type="text"
                        placeholder="搜索场馆或运动..."
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {venues.length === 0 ? (
                <div className="text-center py-20">
                    <Sports className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">未找到匹配的场馆</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <div key={venue.vid}
                             className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                             onClick={() => handleClickVenue(venue.vid)}>
                            <div className="h-48 bg-gray-200 border-2 border-dashed rounded-xl w-full" />
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-gray-900">{venue.name}</h2>
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {venue.sports.length}种运动
              </span>
                                </div>
                                <p className="mt-2 text-gray-600">{venue.description}</p>
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                    <Place className="text-gray-400 mr-1" />
                                    <span>{venue.address}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {venue.sports.slice(0, 3).map((sport) => (
                                        <span key={sport.sid} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {sport.name}
                </span>
                                    ))}
                                    {venue.sports.length > 3 && (
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  +{venue.sports.length - 3}种
                </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ActivityPage;
