import axios from 'axios';

const jikanClient = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
});

export default jikanClient;
