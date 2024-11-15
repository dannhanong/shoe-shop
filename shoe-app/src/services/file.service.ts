import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const previewImage = async (fileCode: string): Promise<string> => {
    const response = await axios.get(`${BASE_URL}/files/preview/${fileCode}`, {
        responseType: 'arraybuffer',
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    return URL.createObjectURL(blob);
};