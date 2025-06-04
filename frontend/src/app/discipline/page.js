"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import styles from "./discipline.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faEye, faSearch, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import DisciplineService from "@/services/DisciplineService";
import Toast from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { handleApiResponse } from "@/libs/apiResponseHandler";
import Button from "@/components/ButtonDefault/button";

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
    main_objetive: ""
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
        (discipline.main_objetive && discipline.main_objetive.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = disciplines.filter(
      (discipline) =>
        discipline.name.toLowerCase().includes(value.toLowerCase()) ||
        (discipline.main_objetive && discipline.main_objetive.toLowerCase().includes(value.toLowerCase()))
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
        main_objetive: discipline.main_objetive
      });
    } else if (mode === 'new') {
      setFormData({
        name: "",
        workload: "",
        syllabus: "",
        main_objetive: ""
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
    if (!formData.name || !formData.workload || !formData.syllabus || !formData.main_objetive) {
      setToastMessage({ type: "warning", text: "Preencha todos os campos obrigatórios!" });
      setToast(true);
      return;
    }
    try {
      if (modalState.mode === 'new') {
        const response = await DisciplineService.CreateDiscipline(formData);
        handleApiResponse(response);
      } else {
        const dataToUpdate = { ...formData, is_active: modalState.data?.is_active };
        const response = await DisciplineService.UpdateDiscipline(modalState.data.id, dataToUpdate);
        handleApiResponse(response);
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
            <InputText
              className={styles.nameFilter}
              type="text"
              value={searchTerm}
              placeholder="Buscar"
              onChange={handleSearch}
            />
            <FontAwesomeIcon
              icon={faSearch}
              size="lg"
              className={styles.searchIcon}
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
              <th>Objetivo Geral</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisciplines.map((discipline) => (
              <tr key={discipline.id} className={!discipline.is_active ? styles.inactiveRow : ''}>
                <td>{discipline.name}</td>
                <td>{discipline.workload}</td>
                <td>{discipline.main_objetive || "N/A"}</td>
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
                <table className={styles.detailsTable}>
                  <tbody>
                    <tr>
                      <td className={styles.detailLabel}><strong>Nome:</strong></td>
                      <td className={styles.detailValue}>{modalState.data?.name}</td>
                    </tr>
                    <tr>
                      <td className={styles.detailLabel}><strong>Carga Horária:</strong></td>
                      <td className={styles.detailValue}>{modalState.data?.workload}</td>
                    </tr>
                    <tr>
                      <td className={styles.detailLabel}><strong>Ementa:</strong></td>
                      <td className={styles.detailValue}>
                        <div className={styles.syllabusBox}>
                          {modalState.data?.syllabus || "N/A"}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.detailLabel}><strong>Objetivo Geral:</strong></td>
                      <td className={styles.detailValue}>{modalState.data?.main_objetive || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className={styles.detailLabel}><strong>Status:</strong></td>
                      <td className={styles.detailValue}>
                        <span className={`${styles.statusIndicator} ${modalState.data?.is_active ? styles.active : styles.inactive}`}>
                          {modalState.data?.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                      name="main_objetive"
                      value={formData.main_objetive}
                      onChange={handleFormChange}
                      disabled={modalState.mode === 'view'}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {modalState.mode === 'view' ? (
                <Button variant="close" onClick={closeModal}>
                  Fechar
                </Button>
              ) : (
                <>
                  <Button variant="cancel" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button variant="save" onClick={handleSave}>
                    <FontAwesomeIcon icon={faSave} /> Salvar
                  </Button>
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