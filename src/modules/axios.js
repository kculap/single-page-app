import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const API_CONFIG = {
  baseURL: import.meta.env.API_URL,
  withCredentials: true,
  timeout: 100_000,
  headers: {
    common: {
      'Content-Type': 'application/json',
    },
  },
};

$axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const $axios = axios.create(API_CONFIG);
