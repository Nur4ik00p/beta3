import axios from "axios";
const instance = axios.create({
    baseURL: 'http://demo.soon-night.lol'  // Добавлен слеш в конце
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;
