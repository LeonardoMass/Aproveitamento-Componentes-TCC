"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faSearch, faEdit } from "@fortawesome/free-solid-svg-icons";
import styles from "./course.module.css";
import ModalCourse from "@/components/Modal/ModalCourse/modal";
import ModalDisciplineList from "@/components/Modal/ModalCourse/disciplineList/modal";
import { courseList } from "@/services/CourseService";
import { useAuth } from "@/context/AuthContext";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [disciplineModal, setDisciplineModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const user = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseList();
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCourses();
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

  const openDisciplineModal = (course) => {
    setSelectedCourse(course);
    setDisciplineModal(true);
  };

  const closeDisciplineModal = () => {
    setSelectedCourse(null);
    setDisciplineModal(false);
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Cursos</h1>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon
              icon={faSearch}
              size="lg"
              className={styles.searchIcon}
            />
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
              <th>Curso</th>
              <th>Coordenador</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.name ?? "N/A"}</td>
                <td>
                  {course.coordinator
                    ? course.coordinator.name
                    : "Coordenador não cadastrado"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDisciplineModal(course);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} size="lg" />
                    </button>
                    {(user.user.type === "Ensino" ||
                      (user.user.type === "Coordenador" && course.coordinator?.id === user.user.id)) && (
                        <button
                          className={styles.editButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModalForEdit(course);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} size="lg" />
                        </button>
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
          <button onClick={() => setModal(true)} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} size="2x" />
          </button>
        </div>
      )}

      {modal && <ModalCourse onClose={closeModal} editData={editData} />}
      {disciplineModal && (
        <ModalDisciplineList
          course={selectedCourse}
          onClose={closeDisciplineModal}
        />
      )}
    </div>
  );
};

export default Course;