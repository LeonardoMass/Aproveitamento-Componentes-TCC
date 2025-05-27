import { useEffect, useState } from "react";
import styles from "./modalCourse.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { courseCreate, courseEdit } from "@/services/CourseService";
import AuthService, { UserList } from "@/services/AuthService";
import { apiClient } from "@/libs/api";
import { handleApiResponse } from "@/libs/apiResponseHandler";
import { ppcCreate } from "@/services/PpcService";
import Button from "@/components/ButtonDefault/button";

const ModalCourse = ({ onClose, editData = null, onCourseSaved }) => {
  const [courseName, setCourseName] = useState("");
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [availableCoordinators, setAvailableCoordinators] = useState([]);
  const [initialPpcName, setInitialPpcName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    setCourseName(editData?.name ?? "");
    const currentCoordinatorId = editData?.coordinator?.id ?? null;
    setSelectedCoordinator(currentCoordinatorId);
    setSelectedProfessors(editData?.professors ?? []);
    setInitialPpcName("");
    setIsSubmitting(false);
    setFetchError("");

    const fetchAvailableData = async () => {
      try {
        const response = await apiClient.get("/users/list", { params: { user_type: "Servant" } });
        const allUsers = response.data?.results || response.data || [];

        const potentialCandidates = allUsers.filter(
          u => u.servant_type === 'Professor' || u.servant_type === 'Coordenador'
        );
        let professorOptions = [...potentialCandidates];
        if (currentCoordinatorId && !professorOptions.some(p => p.id === currentCoordinatorId)) {
          const currentCoordObj = allUsers.find(u => u.id === currentCoordinatorId);
          if (currentCoordObj) {
            professorOptions.unshift(currentCoordObj);
          }
        }
        setAvailableProfessors(professorOptions);
        let coordinatorOptions = potentialCandidates.filter(
          u => u.servant_type === 'Professor'
        );
        if (currentCoordinatorId) {
          const currentCoordinator = potentialCandidates.find(c => c.id === currentCoordinatorId);
          if (currentCoordinator && !coordinatorOptions.some(c => c.id === currentCoordinatorId)) {
            coordinatorOptions.unshift(currentCoordinator);
          }
          else if (!currentCoordinator) {
            const currentCoordFromAll = allUsers.find(u => u.id === currentCoordinatorId);
            if (currentCoordFromAll && !coordinatorOptions.some(c => c.id === currentCoordFromAll.id)) {
              coordinatorOptions.unshift(currentCoordFromAll);
            }
          }
        }
        setAvailableCoordinators(coordinatorOptions);

      } catch (error) {
        console.error("Erro ao buscar usuários disponíveis:", error);
        setFetchError("Falha ao carregar lista de usuários.");
        setAvailableCoordinators([]);
        setAvailableProfessors([]);
      }
    };

    fetchAvailableData();

  }, [editData]);

  const handleRemoveProfessor = (profToRemove) => {
    setSelectedProfessors(prev => prev.filter(p => p.id !== profToRemove.id));
  };

  const handleAddProfessors = (professorId) => {
    if (!professorId) return;
    const professorIdNum = Number(professorId);

    const selectedProfessor = availableProfessors.find(prof => prof.id === professorIdNum);

    if (selectedProfessor && !selectedProfessors.some(prof => prof.id === selectedProfessor.id)) {
      setSelectedProfessors(prev => [...prev, selectedProfessor]);
    }
  };

  const handleSelectCoordinator = (coordinatorId) => {
    const idAsNumber = coordinatorId ? Number(coordinatorId) : null;
    setSelectedCoordinator(idAsNumber);
  };

  const handleChangeProfessorToCoord = async (idProf) => {
    try {
      const prof = await AuthService.getUserById(idProf);
      if (!prof) throw new Error("Professor não encontrado para alteração de tipo.");

      if (prof.servant_type !== 'Professor') {
        console.warn(`Tentativa de mudar tipo de usuário ${idProf} que não é Professor.`);
        return;
      }

      const updatedProf = { ...prof, type: "Coordenador", servant_type: "Coordenador" };
      const formData = new FormData();
      formData.append("name", updatedProf.name);
      formData.append("email", updatedProf.email);
      formData.append("siape", updatedProf.siape);
      formData.append("servant_type", updatedProf.servant_type);

      console.log(`Atualizando usuário ${idProf} para Coordenador...`);
      const response = await AuthService.UpdateUser(idProf, formData);
      return response;
    } catch (error) {
      console.error(`Erro ao alterar professor ${idProf} para coordenador:`, error);
      handleApiResponse(error.response || { status: 500, data: { detail: `Erro interno ao atualizar tipo do usuário ${idProf}.` } });
      throw error;
    }
  };

  const handleChangeCoordToProfessor = async (coord) => {
    try {
      if (!coord || !coord.id) {
        console.warn("Tentativa de reverter tipo de coordenador inválido.");
        return;
      }
      const currentCoordData = await AuthService.getUserById(coord.id);
      if (!currentCoordData) throw new Error(`Coordenador com ID ${coord.id} não encontrado para reverter tipo.`);
      if (currentCoordData.servant_type !== 'Coordenador') {
        console.warn(`Tentativa de mudar tipo de usuário ${coord.id} que não é Coordenador.`);
        return;
      }

      const updatedCoord = { ...currentCoordData, type: 'Professor', servant_type: 'Professor' };
      const formData = new FormData();
      formData.append('name', updatedCoord.name);
      formData.append('email', updatedCoord.email);
      formData.append('siape', updatedCoord.siape);
      formData.append('servant_type', updatedCoord.servant_type);

      console.log(`Revertendo usuário ${coord.id} para Professor...`);
      const response = await AuthService.UpdateUser(coord.id, formData);
      return response;
    } catch (error) {
      console.error(`Erro ao alterar coordenador ${coord?.id} para professor:`, error);
      handleApiResponse(error.response || { status: 500, data: { detail: `Erro interno ao atualizar tipo do usuário ${coord?.id}.` } });
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!courseName.trim()) {
      alert("O nome do curso é obrigatório.");
      return;
    }
    setIsSubmitting(true);

    const courseDataPayload = {
      name: courseName.trim(),
      professor_ids: selectedProfessors.map((prof) => prof.id),
      coordinator_id: selectedCoordinator || null,
    };

    try {
      const originalCoordId = editData?.coordinator?.id ?? null;
      const newSelectedCoordId = selectedCoordinator ?? null;

      let userToMakeCoordinator = null;
      let originalCoordinatorData = editData?.coordinator ?? null;

      if (originalCoordId !== newSelectedCoordId) {
        console.log(`Mudança de Coordenador detectada: ${originalCoordId} -> ${newSelectedCoordId}`);

        if (newSelectedCoordId) {
          userToMakeCoordinator = availableProfessors.find(p => p.id === newSelectedCoordId);

          if (userToMakeCoordinator && userToMakeCoordinator.servant_type === 'Professor') {
            console.log(`Promovendo Professor ${newSelectedCoordId} para Coordenador.`);
            const coord = await handleChangeProfessorToCoord(newSelectedCoordId);
          } else if (userToMakeCoordinator && userToMakeCoordinator.servant_type === 'Coordenador') {
            if (userToMakeCoordinator.id !== originalCoordId) {
              console.warn(`Usuário ${newSelectedCoordId} selecionado como coordenador já é Coordenador`);
            }
          } else if (!userToMakeCoordinator) {
            throw new Error(`Usuário selecionado como coordenador (ID: ${newSelectedCoordId}) não encontrado na lista de disponíveis.`);
          }
        }

        if (originalCoordId && originalCoordinatorData) {
          console.log(`Revertendo Coordenador original ${originalCoordId} para Professor.`);
          const professor = await handleChangeCoordToProfessor(originalCoordinatorData);
        }
      }
      console.log("Enviando dados do curso para API:", courseDataPayload);
      let savedCourseResponse;
      if (editData) {
        console.log(`Editando curso ID: ${editData.id}`);
        savedCourseResponse = await courseEdit(editData.id, courseDataPayload);
        handleApiResponse(savedCourseResponse);
      } else {
        console.log("Criando novo curso.");
        savedCourseResponse = await courseCreate(courseDataPayload);
        handleApiResponse(savedCourseResponse);
      }
      const actualSavedCourse = savedCourseResponse?.data || savedCourseResponse;

      if (!editData && initialPpcName.trim() && actualSavedCourse?.id) {
        console.log(`Tentando criar PPC inicial '${initialPpcName.trim()}' para o curso ID: ${actualSavedCourse.id}`);
        try {
          await ppcCreate({
            name: initialPpcName.trim(),
            course_id: actualSavedCourse.id,
          });
          console.log("PPC inicial criado com sucesso.");
        } catch (ppcError) {
          console.error("Falha ao criar PPC inicial (curso JÁ foi salvo):", ppcError);
          alert(`Curso ${editData ? 'atualizado' : 'criado'} com sucesso, mas falha ao criar PPC inicial: ${ppcError?.response?.data?.detail || ppcError.message}`);
        }
      }
      if (onCourseSaved) {
        onCourseSaved();
      } else {
        onClose(); 
      }

    } catch (error) {
      console.error("Erro GERAL no processo de salvar curso:", error);
      handleApiResponse(error.response);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>{editData ? "Editar Curso" : "Cadastrar Novo Curso"}</h2>

        <div className={styles.formGroup}>
          <label htmlFor="courseName" className={styles.label}>Nome do Curso*</label>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Nome do curso"
            className={styles.input}
            required
            disabled={isSubmitting}
          />
        </div>

        {!editData && (
          <div className={styles.formGroup}>
            <label htmlFor="initialPpcName" className={styles.label}>Nome do PPC Inicial (Opcional)</label>
            <input
              id="initialPpcName"
              type="text"
              value={initialPpcName}
              onChange={(e) => setInitialPpcName(e.target.value)}
              placeholder="Ex: PPC 2025.1 (será criado vazio)"
              className={styles.input}
              disabled={isSubmitting}
            />
            <small className={styles.helpText}>Disciplinas devem ser adicionadas após criar o curso/PPC.</small>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="coordinatorSelect" className={styles.label}>Coordenador</label>
          <select
            id="coordinatorSelect"
            value={selectedCoordinator ?? ""} 
            onChange={(e) => handleSelectCoordinator(e.target.value)}
            className={styles.select}
            disabled={isSubmitting || fetchError}
          >
            <option value="" disabled>Nenhum Coordenador</option>
            {availableCoordinators.map((coord) => (
              <option key={coord.id} value={coord.id}>
                {coord.name} {editData?.coordinator?.id === coord.id ? "(Atual)" : ""}
              </option>
            ))}
          </select>
          {fetchError && <small className={styles.errorText}>{fetchError}</small>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Professores</label>
          <div className={styles.selectedItemsContainer}>
            {selectedProfessors.length === 0 && <span className={styles.placeholder}>Nenhum professor selecionado</span>}
            {selectedProfessors.map((prof) => (
              <span key={prof.id} className={styles.selectedItem}>
                {prof.name}
                <button onClick={() => handleRemoveProfessor(prof)} className={styles.removeButton} title="Remover professor" disabled={isSubmitting}>
                  <FontAwesomeIcon icon={faTrash} size="xs" />
                </button>
              </span>
            ))}
          </div>
          <select
            onChange={(e) => { handleAddProfessors(e.target.value); e.target.value = ""; }}
            value=""
            className={styles.select}
            disabled={isSubmitting || fetchError}
          >
            <option value="" disabled>Adicionar professor...</option>
            {availableProfessors
              .filter(prof => !selectedProfessors.some(sp => sp.id === prof.id))
              .map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.name}
                </option>
              ))}
          </select>
        </div>

        <div className={styles.modalActions}>
          <Button variant="cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="save" onClick={handleSubmit} disabled={isSubmitting || !courseName.trim() || fetchError}>
            {isSubmitting ? "Salvando..." : (editData ? "Salvar Alterações" : "Cadastrar Curso")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalCourse;