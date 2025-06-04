export const StatusEnum = Object.freeze([
    "Solicitação criada",
    "Cancelado pelo Aluno",
    "Cancelado pelo Ensino",
    "Encaminhado para o Coordenador",
    "Em análise do Coordenador",
    "Cancelado pelo Coordenador",
    "Analisado pelo Coordenador",
    "Em análise do Professor",
    "Rejeitado pelo Professor",
    "Analisado pelo Professor",
    "Em homologação do Coordenador",
    "Retornado pelo Coordenador",
    "Rejeitado pelo Coordenador",
    "Aprovado pelo Coordenador",
    "Em aguardo para divulgação",
    "Retornado pelo Ensino",
    "Rejeitado pelo Ensino",
    "Finalizado e divulgado",
]);

export const steps = [
    {index: 0, label: 'Período de análise'},
    {index: 1, label: 'Análise do Coordenador'},
    {index: 2, label: 'Análise do Professor'},
    {index: 3, label: 'Homologação do Coordenador'},
    {index: 4, label: 'Aguardando divulgação'}
]


export const filterStatus = [
    "Sucesso",
    "Pendente",
    "Falha"
]

export function getEnumIndexByValue(value) {
    return StatusEnum.indexOf(value);
}

export function getSucceeded() {
    return ["Encaminhado para o Coordenador", "Analisado pelo Coordenador", "Analisado pelo Professor",
        "Aprovado pelo Coordenador", "Finalizado e divulgado"];
}

export function getFailed() {
    return ["Cancelado pelo Aluno", "Cancelado pelo Ensino", "Cancelado pelo Coordenador",
        "Rejeitado pelo Professor", "Rejeitado pelo Coordenador", "Rejeitado pelo Ensino"];
}

export function getPending() {
    return ["Solicitação criada", "Em análise do Coordenador", "Em análise do Professor", "Em homologação do Coordenador",
        "Retornado pelo Coordenador", "Em aguardo para divulgação", "Retornado pelo Ensino"]
}

export function getStatusStepIndex(status) {
    if (getStep1Status().includes(status)) return 0;
    if (getStep2Status().includes(status)) return 1;
    if (getStep3Status().includes(status)) return 2;
    if (getStep4Status().includes(status)) return 3;
    if (getStep5Status().includes(status)) return 4;
    if (getStep6Status().includes(status)) return 4;
}

export function getStep1Status() {
    return ["Solicitação criada", "Cancelado pelo Aluno", "Cancelado pelo Ensino", "Encaminhado para o Coordenador"];
}

export function getStep2Status() {
    return ["Em análise do Coordenador", "Cancelado pelo Coordenador", "Analisado pelo Coordenador"]
}

export function getStep3Status() {
    return ["Em análise do Professor", "Rejeitado pelo Professor", "Analisado pelo Professor", "Retornado pelo Coordenador"]
}

export function getStep4Status() {
    return ["Em homologação do Coordenador", "Rejeitado pelo Coordenador", "Aprovado pelo Coordenador", "Retornado pelo Ensino"]
}

export function getStep5Status() {
    return ["Em aguardo para divulgação", "Rejeitado pelo Ensino", "Finalizado e divulgado"]
}

export function getStep6Status() {
    return ["Finalizado e divulgado"]
}

export function getStatus(status) {
    switch (status) {
        case "Solicitação criada":
            return "CRE";
        case "Cancelado pelo Aluno":
            return "CANCELED";
        case "Cancelado pelo Ensino":
            return "C_CRE";
        case "Encaminhado para o Coordenador":
            return "A_CRE";
        case "Em análise do Coordenador":
            return "COORD";
        case "Cancelado pelo Coordenador":
            return "C_COORD";
        case "Analisado pelo Coordenador":
            return "A_COORD";
        case "Em análise do Professor":
            return "PROF";
        case "Rejeitado pelo Professor":
            return "RJ_PROF";
        case "Analisado pelo Professor":
            return "A_PROF";
        case "Em homologação do Coordenador":
            return "IN_AP_COORD";
        case "Retornado pelo Coordenador":
            return "R_COORD";
        case "Rejeitado pelo Coordenador":
            return "RJ_COORD";
        case "Aprovado pelo Coordenador":
            return "AP_COORD";
        case "Em aguardo para divulgação":
            return "IN_AP_CRE";
        case "Retornado pelo Ensino":
            return "R_CRE";
        case "Rejeitado pelo Ensino":
            return "RJ_CRE";
        case "Finalizado e divulgado":
            return "AP_CRE";
    }
}
