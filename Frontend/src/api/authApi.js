import api from './config';

export const loginUsuario = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; 
};

export const registrarUsuario = async ({ email, password }) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
};