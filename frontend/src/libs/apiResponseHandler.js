import { toast } from 'react-toastify';

export function handleApiResponse(response) {
    let message = Object.values(response.data) 
    switch (response?.status) {
        case 200:
            toast.success(message[0][0]);
            break;
        case 201:
            toast.warn(message[0][0]);
            break;
        case 400:
            toast.error(message[0][0]);
            break;
        default:
            
    }
}