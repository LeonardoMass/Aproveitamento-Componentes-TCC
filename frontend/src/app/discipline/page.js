"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import styles from "./discipline.module.css";
import { Button } from "../../components/Button/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faEye, faSearch, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import DisciplineService from "@/services/DisciplineService";
import Toast from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { handleApiResponse } from "@/libs/apiResponseHandler";

const Discipline = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState({
    open: false,
    mode: 'view',
    data: null
  });
  const [formData, setFormData] = useState({
    name: "",
    workload: "",
    syllabus: "",
    professors: ""
  });
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({});
  const user = useAuth();

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const data = await DisciplineService.DisciplineList();
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setDisciplines(sortedData);
        setFilteredDisciplines(sortedData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDisciplines();
  }, []);

  const applySearchFilter = (data) => {
    return data.filter(
      (discipline) =>
        discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discipline.professors && discipline.professors.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = disciplines.filter(
      (discipline) =>
        discipline.name.toLowerCase().includes(value.toLowerCase()) ||
        (discipline.professors && discipline.professors.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredDisciplines(filtered);
  };

  const openModal = (mode, discipline = null) => {
    setModalState({
      open: true,
      mode,
      data: discipline
    });

    if (mode === 'edit' && discipline) {
      setFormData({
        name: discipline.name,
        workload: discipline.workload,
        syllabus: discipline.syllabus,
        professors: discipline.professors
      });
    } else if (mode === 'new') {
      setFormData({
        name: "",
        workload: "",
        syllabus: "",
        professors: ""
      });
    }
  };

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', data: null });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.workload || !formData.syllabus || !formData.professors) {
      setToastMessage({ type: "warning", text: "Preencha todos os campos obrigatórios!" });
      setToast(true);
      return;
    }
    try {
      if (modalState.mode === 'new') {
        await DisciplineService.CreateDiscipline(formData);
        setToastMessage({ type: "success", text: "Disciplina criada com sucesso!" });
      } else {
        const dataToUpdate = { ...formData, is_active: modalState.data?.is_active };
        await DisciplineService.UpdateDiscipline(modalState.data.id, dataToUpdate);
        setToastMessage({ type: "success", text: "Disciplina atualizada com sucesso!" });
      }

      const updatedData = await DisciplineService.DisciplineList();
      const sortedData = updatedData.sort((a, b) => a.name.localeCompare(b.name));
      setDisciplines(sortedData);
      setFilteredDisciplines(applySearchFilter(sortedData));
      closeModal();
    } catch (err) {
      setToastMessage({ type: "error", text: "Erro ao salvar disciplina!" });
    }
    setToast(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await DisciplineService.DeleteDiscipline(id);
      console.log("Delete Response:", response);
      handleApiResponse(response);
      let updatedDisciplinesList = [...disciplines];

      if (response.status === 204) {
        updatedDisciplinesList = disciplines.filter(d => d.id !== id);
      }
      if (response.status === 200 && response.data?.detail) {
        let message = response.data.detail;
        if (message.includes("inativada")) {
          updatedDisciplinesList = disciplines.map(d =>
            d.id === id ? { ...d, is_active: false } : d
          );
        }
        if (message.includes("ativa")) {
          updatedDisciplinesList = disciplines.map(d =>
            d.id === id ? { ...d, is_active: true } : d
          );
        }
        const freshData = await DisciplineService.DisciplineList();
        updatedDisciplinesList = freshData.sort((a, b) => a.name.localeCompare(b.name));
      }
      setDisciplines(updatedDisciplinesList);
      setFilteredDisciplines(applySearchFilter(updatedDisciplinesList));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Disciplinas</h1>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <InputText
              className={styles.nameFilter}
              type="text"
              value={searchTerm}
              placeholder="Buscar pela disciplina.."
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className={styles.scrollableTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Carga Horária</th>
              <th>Ementa</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisciplines.map((discipline) => (
              <tr key={discipline.id} className={!discipline.is_active ? styles.inactiveRow : ''}>
                <td>{discipline.name}</td>
                <td>{discipline.workload}</td>
                <td>{discipline.syllabus || "N/A"}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => openModal('view', discipline)}
                      title="Visualizar"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {user.user.type === "Ensino" && (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={() => openModal('edit', discipline)}
                          title="Editar"
                          disabled={!discipline.is_active}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(discipline.id)}
                          title="Inativar/Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user.user.type === "Ensino" && (
        <div className={styles.addButtonContainer}>
          <button
            onClick={() => openModal('new')}
            className={styles.addButton}
            title="Adicionar Nova Disciplina"
          >
            <FontAwesomeIcon icon={faPlus} size="2x" />
          </button>
        </div>
      )}

      {modalState.open && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <h2>
              {modalState.mode === 'view' && 'Detalhes da Disciplina'}
              {modalState.mode === 'edit' && 'Editar Disciplina'}
              {modalState.mode === 'new' && 'Nova Disciplina'}
            </h2>

            <div className={styles.modalBody}>
              {(modalState.mode === 'view') ? (
                <>
                  <p><strong>Nome:</strong> {modalState.data?.name}</p>
                  <p><strong>Carga Horária:</strong> {modalState.data?.workload}</p>
                  <p><strong>Ementa:</strong> {modalState.data?.syllabus}</p>
                  <p><strong>Objetivo Geral:</strong> {modalState.data?.professors || "N/A"}</p>
                  <p><strong>Status:</strong> {modalState.data?.is_active ? "Ativa" : "Inativa"}</p>
                </>
              ) : (
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nome: </label>
                    <InputText
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      disabled={modalState.mode === 'view'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Carga Horária:</label>
                    <InputText
                      type="text"
                      name="workload"
                      value={formData.workload}
                      onChange={handleFormChange}
                      disabled={modalState.mode === 'view'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ementa:</label>
                    <InputTextarea
                      name="syllabus"
                      value={formData.syllabus}
                      onChange={handleFormChange}
                      disabled={modalState.mode === 'view'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Objetivo Geral:</label>
                    <InputText
                      type="text"
                      name="professors"
                      value={formData.professors}
                      onChange={handleFormChange}
                      disabled={modalState.mode === 'view'}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {modalState.mode === 'view' ? (
                <button className={styles.closeButton} onClick={closeModal}>
                  Fechar
                </button>
              ) : (
                <>
                  <button className={styles.saveButton} onClick={handleSave}>
                    <FontAwesomeIcon icon={faSave} /> Salvar
                  </button>
                  <button className={styles.cancelButton} onClick={closeModal}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast type={toastMessage.type} close={() => setToast(false)}>
          {toastMessage.text}
        </Toast>
      )}
    </div>
  );
};

export default Discipline;