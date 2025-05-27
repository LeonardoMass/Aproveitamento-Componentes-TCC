"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faSearch, faEdit, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
import styles from "./course.module.css";
import ModalCourse from "@/components/Modal/ModalCourse/modal";
import ModalPpcDisciplineList from "@/components/Modal/ModalCourse/disciplineList/modal";
import ModalPpcSelector from "@/components/Modal/ModalCourse/ppcSelector/modal";
import { courseList } from "@/services/CourseService";
import { useAuth } from "@/context/AuthContext";
import { ppcList } from "@/services/PpcService";
import { InputText } from 'primereact/inputtext';

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [ppcDisciplineModal, setPpcDisciplineModal] = useState(false);
  const [ppcSelectorModal, setPpcSelectorModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [ppcsForSelector, setPpcsForSelector] = useState([]);
  const { user } = useAuth();

  const fetchCoursesAndSetState = async () => {
    try {
      const data = await courseList();
      const coursesArray = Array.isArray(data) ? data : ['Cursos não encontrados'];
      setCourses(coursesArray);
      if (searchTerm) {
        const filtered = coursesArray.filter((course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses(coursesArray);
      }
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
      setCourses([]);
      setFilteredCourses([]);
    }
  };

  useEffect(() => {
    fetchCoursesAndSetState();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const openModalForEdit = (course) => {
    setEditData(course);
    setModal(true);
  };

  const closeModal = () => {
    setEditData(null);
    setModal(false);
  };

  const handleCourseSaveSuccess = () => {
    fetchCoursesAndSetState();
    closeModal();
  };

  const openPpcDisciplineModal = (course) => {
    setSelectedCourse(course);
    setPpcDisciplineModal(true);
  };

  const closePpcDisciplineModal = () => {
    setSelectedCourse(null);
    setPpcDisciplineModal(false);
  };

  const fetchPpcsForModal = async (currentCourse) => {
    if (!currentCourse) return;
    try {
      const fetchedPpcs = await ppcList({ course_id: currentCourse.id });
      setPpcsForSelector(Array.isArray(fetchedPpcs) ? fetchedPpcs : []);
    } catch (error) {
      console.error("Erro ao buscar PPCs para seleção:", error);
      setPpcsForSelector([]);
    }
  };

  const openPpcSelectorModal = async (course) => {
    setSelectedCourse(course);
    await fetchPpcsForModal(course);
    setPpcSelectorModal(true);
  };

  const closePpcSelectorModal = () => {
    setSelectedCourse(null);
    setPpcsForSelector([]);
    setPpcSelectorModal(false);
  };

  const handlePpcCreationSuccessInModal = async () => {
    if (selectedCourse) {
      await fetchPpcsForModal(selectedCourse);
    }
  };

  const userType = user.type;
  const userId = user.id;

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Gerenciamento de Cursos</h1>
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
              <th>Curso</th>
              <th>Coordenador</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredCourses) && filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name ?? "N/A"}</td>
                  <td>
                    {course.coordinator
                      ? course.coordinator.name
                      : <span className={styles.notAssigned}>Não atribuído</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        onClick={(e) => { e.stopPropagation(); openPpcDisciplineModal(course); }}
                        title="Visualizar Disciplinas (do 1º PPC)"
                      >
                        <FontAwesomeIcon icon={faEye} size="sm" />
                        <span>Disciplinas</span>
                      </button>
                      {(userType === "Ensino" || (userType === "Coordenador" && course.coordinator?.id === userId)) && (
                        <button
                          className={`${styles.actionButton} ${styles.managePpcButton}`}
                          onClick={(e) => { e.stopPropagation(); openPpcSelectorModal(course); }}
                          title="Gerenciar PPCs do Curso"
                        >
                          <FontAwesomeIcon icon={faProjectDiagram} size="sm" />
                          <span>PPCs</span>
                        </button>
                      )}
                      {(userType === "Ensino" || (userType === "Coordenador" && course.coordinator?.id === userId)) && (
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={(e) => { e.stopPropagation(); openModalForEdit(course); }}
                          title="Editar Curso"
                        >
                          <FontAwesomeIcon icon={faEdit} size="sm" />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={styles.noResults}>Nenhum curso encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {userType === "Ensino" && (
        <div className={styles.addButtonContainer}>
          <button onClick={() => { setEditData(null); setModal(true); }} className={styles.addButton} title="Cadastrar Novo Curso">
            <FontAwesomeIcon icon={faPlus} size="lg" />
            <span>Novo Curso</span>
          </button>
        </div>
      )}

      {modal && <ModalCourse onClose={closeModal} editData={editData} onCourseSaved={handleCourseSaveSuccess} />}
      {ppcDisciplineModal && <ModalPpcDisciplineList course={selectedCourse} onClose={closePpcDisciplineModal} />}
      {ppcSelectorModal && <ModalPpcSelector course={selectedCourse} ppcs={ppcsForSelector} onClose={closePpcSelectorModal} onPpcCreated={handlePpcCreationSuccessInModal} />}
    </div>
  );
};

export default Course;