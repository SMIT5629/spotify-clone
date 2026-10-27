// Centralized API client service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthToken() {
    return localStorage.getItem('spotify_token') || '';
}

export function setAuthToken(token) {
    if (token) {
        localStorage.setItem('spotify_token', token);
    } else {
        localStorage.removeItem('spotify_token');
    }
}

export async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    // If sending FormData, do not set Content-Type header so browser sets multipart boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers,
        credentials: 'include' // include cookies
    };

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const errorMsg = data && data.message ? data.message : `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

// Authentication
export const authApi = {
    login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    getMe: () => apiRequest('/api/auth/me', { method: 'GET' }),
    updateProfile: (data) => {
        const isFormData = data instanceof FormData;
        return apiRequest('/api/auth/profile', {
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data)
        });
    }
};

// Music & Tracks
export const musicApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/api/music${query ? `?${query}` : ''}`);
    },
    getFeatured: () => apiRequest('/api/music/featured'),
    getById: (id) => apiRequest(`/api/music/${id}`),
    getAlbums: (query = '') => apiRequest(`/api/music/albums${query ? `?q=${encodeURIComponent(query)}` : ''}`),
    getAlbumById: (albumId) => apiRequest(`/api/music/albums/${albumId}`),
    getArtists: () => apiRequest('/api/music/artists'),
    getArtistById: (id) => apiRequest(`/api/music/artists/${id}`),
    streamUrl: (id) => `${API_BASE_URL}/api/music/${id}/stream`,
    uploadTrack: (formData) => apiRequest('/api/music/upload', { method: 'POST', body: formData }),
    createAlbum: (albumData) => apiRequest('/api/music/album', { method: 'POST', body: JSON.stringify(albumData) }),
    getLikedSongs: () => apiRequest('/api/music/likes'),
    toggleLike: (songId) => apiRequest(`/api/music/likes/${songId}`, { method: 'POST' }),
    getMyTracks: () => apiRequest('/api/music/my'),
    updateTrack: (id, data) => {
        const isFormData = data instanceof FormData;
        return apiRequest(`/api/music/${id}`, {
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    deleteTrack: (id) => apiRequest(`/api/music/${id}`, { method: 'DELETE' })
};

// Playlists
export const playlistApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/api/playlists${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/api/playlists/${id}`),
    create: (data) => apiRequest('/api/playlists', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/api/playlists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    addSong: (playlistId, songId) => apiRequest(`/api/playlists/${playlistId}/songs`, { method: 'POST', body: JSON.stringify({ songId }) }),
    removeSong: (playlistId, songId) => apiRequest(`/api/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' })
};
