import { apiClient } from "@/libs/api";

export async function DisciplineList() {
    return apiClient.get('/api/disciplines/').then((response) => response.data);
}

// Função para criar uma nova disciplina
async function CreateDiscipline(data) {
    try {
      // Envia a requisição POST para criar a disciplina
      const response = await apiClient.post('/api/disciplines/', data);
  
      // Verifica se a resposta foi bem-sucedida
      if (response.status === 201) {
        return response; // Retorna os dados da disciplina criada
      } else {
        throw new Error('Falha ao criar disciplina'); // Lança erro se status não for 201
      }
    } catch (error) {
      console.error('Erro ao criar disciplina:', error);
      throw error; // Repassa o erro para quem chamou
    }
  }

// Função para obter uma disciplina específica pelo ID
export async function GetDiscipline(id, active = null) {
  try {
    const query = active !== null ? `?active=${active}` : '';
    const response = await apiClient.get(`/api/disciplines/${id}/${query}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar disciplina com ID ${id}:`, error);
    return null;
  }
}

// Função para atualizar uma disciplina existente pelo ID
async function UpdateDiscipline(uuid, data) {
  try {
    const response = await apiClient.put(`/api/disciplines/${uuid}/`, data);
    return response;
  } catch (error) {
    console.error(`Erro ao atualizar disciplina com UUID ${uuid}:`, error);
    throw error;
  }
}

// Função para deletar uma disciplina pelo ID
async function DeleteDiscipline(uuid) {
    return apiClient.delete(`/api/disciplines/${uuid}/`)  // Usando uuid no caminho
      .then((response) => response)
      .catch((error) => {
        console.error("Erro ao excluir disciplina:", error);
        throw error;
      });
  }

  export const getDisciplineDetailsBatch = async (disciplineIds, active = null) => {
    if (!disciplineIds || disciplineIds.length === 0) {
      return [];
    }
    try {
      const disciplinePromises = disciplineIds.map(id => GetDiscipline(id, active));
      const disciplines = await Promise.all(disciplinePromises);
      return disciplines.filter(discipline => discipline !== null);
    } catch (error) {
      console.error("Erro inesperado no batch de busca de disciplinas:", error);
      return [];
    }
  };

  export default {
      DisciplineList,
      CreateDiscipline,
      GetDiscipline,
      UpdateDiscipline,
      DeleteDiscipline,
      getDisciplineDetailsBatch
  };