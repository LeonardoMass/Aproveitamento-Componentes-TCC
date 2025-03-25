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

const Discipline = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState({
    open: false,
    mode: 'view', // 'view', 'edit' or 'new'
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
        console.log(data);
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setDisciplines(sortedData);
        setFilteredDisciplines(sortedData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchDisciplines();
  }, []);

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
      setToast(true);
      setToastMessage({
        type: "warning",
        text: "Preencha todos os campos obrigatórios!"
      });
      return;
    }
    console.log(formData);
    console.log(modalState);
    try {
      if (modalState.mode === 'new') {
        await DisciplineService.CreateDiscipline(formData);
        setToastMessage({ type: "success", text: "Disciplina criada com sucesso!" });
      } else {
        await DisciplineService.UpdateDiscipline(modalState.data.id, formData);
        setToastMessage({ type: "success", text: "Disciplina atualizada com sucesso!" });
      }

      const updatedData = await DisciplineService.DisciplineList();
      const sortedData = updatedData.sort((a, b) => a.name.localeCompare(b.name));
      setDisciplines(sortedData);
      setFilteredDisciplines(sortedData);
      closeModal();
    } catch (err) {
      setToastMessage({ type: "error", text: "Erro ao salvar disciplina!" });
    }
    setToast(true);
  };

  const handleDelete = async (id) => {
    try {
      await DisciplineService.DeleteDiscipline(id);
      const updatedData = disciplines.filter(d => d.id !== id);
      setDisciplines(updatedData);
      setFilteredDisciplines(updatedData);
      setToastMessage({ type: "success", text: "Disciplina excluída com sucesso!" });
    } catch (err) {
      setToastMessage({ type: "error", text: "Erro ao excluir disciplina!" });
    }
    setToast(true);
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Disciplinas</h1>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
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
              <tr key={discipline.id}>
                <td>{discipline.name}</td>
                <td>{discipline.workload}</td>
                <td>{discipline.syllabus || "N/A"}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => openModal('view', discipline)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {user.user.type === "Ensino" && (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={() => openModal('edit', discipline)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(discipline.id)}
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