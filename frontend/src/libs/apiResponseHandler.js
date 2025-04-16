import { toast } from 'react-toastify';
function extractMessagesFromDetails(detailsObject) {
    const messages = [];
    if (detailsObject && typeof detailsObject === 'object') {
        Object.values(detailsObject).forEach(value => {
            if (Array.isArray(value)) {
                value.forEach(msg => {
                    if (typeof msg === 'string') {
                        messages.push(msg);
                    }
                });
            }
        });
    }
    return messages;
}
export function handleApiResponse(response) {
    if (!response) {
        console.error("handleApiResponse: 'response' é indefinido ou nulo.");
        toast.error("Erro inesperado na resposta da API.");
        return;
    }

    const status = response.status;
    const data = response.data;

    if (status >= 200 && status < 300) {
        const customSuccessMessage = (typeof data === 'object' && data !== null && data.message) ? data.message : null;
        let defaultMessage = "Operação realizada com sucesso!";

        switch (status) {
            case 201:
                defaultMessage = "Recurso criado com sucesso!";
                break;
            case 204:
                return;
            // case 200:
            // case 202:
        }
        toast.success(customSuccessMessage || defaultMessage);
    }
    else if (status >= 400 && data) {
        let errorMessages = [];
        let displayMessage = '';

        if (data.details) {
            errorMessages = extractMessagesFromDetails(data.details);
        }

        if (errorMessages.length > 0) {
            displayMessage = errorMessages.join(' \n');
        } else if (data.message && typeof data.message === 'string') {
            displayMessage = data.message;
        } else {
            displayMessage = `Erro inesperado (${status}).`;
        }
        console.error(`Erro ${status}:`, displayMessage, "| Dados:", data);

        switch (status) {
            case 400: // Bad Request
                toast.error(displayMessage);
                break;
            case 401: // Unauthorized
                toast.error(displayMessage || "Acesso não autorizado.");
                break;
            case 403: // Forbidden
                toast.error(displayMessage || "Permissão negada.");
                break;
            case 404: // Not Found
                toast.error(displayMessage || "Recurso não encontrado.");
                break;
            case 409: // Conflict
                toast.warn(`Conflito: ${displayMessage}`);
                break;
            case 422: // Unprocessable Entity
                toast.error(`Dados inválidos: ${displayMessage}`);
                break;
            case 500: // Internal Server Error
            case 502: // Bad Gateway
            case 503: // Service Unavailable
            case 504: // Gateway Timeout
                toast.error("Erro interno do servidor. Tente novamente mais tarde.");
                break;
            default:
                toast.error(`Erro ${status}: ${displayMessage}`);
                break;
        }
    } else {
        console.warn(`Status HTTP não tratado ou sem dados: ${status}`, data);
        if (status >= 400) { // Se for um status de erro desconhecido
            toast.error(`Erro inesperado (${status}).`);
        }
    }
}