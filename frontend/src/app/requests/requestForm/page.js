"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./requestForm.module.css";
import Button from "@/components/ButtonDefault/button";
import { noticeListAll } from "@/services/NoticeService";
import { FileUpload } from "primereact/fileupload";
import RequestService from "@/services/RequestService";
import { courseListByName } from "@/services/CourseService";
import { getDisciplineByArrayIds } from "@/services/DisciplineService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ppcList } from "@/services/PpcService";

const CertificationRequestForm = () => {
  const [requestType, setRequestType] = useState("");
  const [previousKnowledge, setPreviousKnowledge] = useState("");
  const [previousCourse, setPreviousCourse] = useState("");
  const [courseWorkload, setCourseWorkload] = useState("");
  const [courseStudiedWorkload, setCourseStudiedWorkload] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedPpc, setSelectedPpc] = useState("");
  const [ppc, setPpc] = useState([]);
  const [disciplineId, setDisciplineId] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState("");
  const [status] = useState("CR");
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const idCounterRef = useRef(1);
  const [uploadLines, setUploadLines] = useState([{ id: idCounterRef.current, file: null }]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const course = await courseListByName({ course_name: user.course });
        console.log(course);
        setSelectedCourse(course);
        const ppcsData = await ppcList({ course_id: course.id });
        console.log("PPCs:", ppcsData);
        setPpc(ppcsData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeData = await noticeListAll();
        console.log(noticeData);
        setNotices(noticeData.results);
        const currentNotice = noticeData.results
          .filter(
            (notice) =>
              new Date(notice.documentation_submission_start) <= new Date() &&
              new Date(notice.documentation_submission_end) >= new Date()
          )
          .sort(
            (a, b) =>
              new Date(b.documentation_submission_start) - new Date(a.documentation_submission_start)
          )
          .slice(0, 1)[0];
        setSelectedNotice(currentNotice || null);
      } catch (error) {
        console.error("Erro ao buscar notices:", error);
      }
    };

    fetchNotices();
  }, []);

  const handlePpcChange = async (e) => {
    const selectedPpcId = e.target.value;
    setSelectedPpc(selectedPpcId);

    const selectedPpcObj = ppc.find((item) => item.id === selectedPpcId);
    if (selectedPpcObj && selectedPpcObj.disciplines && selectedPpcObj.disciplines.length > 0) {
      const disciplineDetails = await getDisciplineByArrayIds(selectedPpcObj.disciplines, true);
      setDisciplines(disciplineDetails);
    } else {
      setDisciplines([]);
    }
  };

  const handleFileSelect = (lineId, event) => {
    const file = event.files && event.files.length > 0 ? event.files[0] : null;
    setUploadLines((prevLines) =>
      prevLines.map((line) => (line.id === lineId ? { ...line, file: file } : line))
    );
    console.log("Linhas de upload após seleção de arquivo:", uploadLines);
  };

  const addUploadLine = () => {
    idCounterRef.current += 1;
    setUploadLines((prevLines) => [...prevLines, { id: idCounterRef.current, file: null }]);
    console.log("Linhas de upload após adição:", uploadLines);
  };

  const removeUploadLine = (lineId) => {
    setUploadLines((prevLines) => prevLines.filter((line) => line.id !== lineId));
    console.log("Linhas de upload após remoção:", uploadLines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData();
    formData.append("discipline", disciplineId);
    formData.append("course", selectedCourse.id);
    formData.append("notice", selectedNotice.id);
    formData.append("course_workload", courseWorkload);
    formData.append("course_studied_workload", courseStudiedWorkload);
    formData.append("previous_course", previousCourse);
    formData.append("status", status);
    formData.append("student_id", user.id);

    console.log("Status sendo enviado:", status);

    if (requestType === "certificacao") {
      formData.append("requestType", "certificacao");
      formData.append("previous_knowledge", previousKnowledge);
    } else if (requestType === "aproveitamento") {
      formData.append("requestType", "aproveitamento");
    } else {
      console.error("Tipo de requisição inválido.");
      return;
    }

    // Anexar os arquivos de cada linha ao formData
    uploadLines.forEach((line) => {
      if (line.file) {
        formData.append("attachment", line.file);
      }
    });
    try {
      let formType = requestType === "certificacao" ? "knowledge-certifications" : "recognition-forms";
      const response =
        requestType === "certificacao"
          ? await RequestService.CreateKnowledgeCertification(formData)
          : await RequestService.CreateRecognitionForm(formData);
      console.log("Resposta do servidor:", response);
      if (response.status === 201) {
        console.log("Formulário enviado com sucesso!");
        window.location.href = `/requests/details/${formType}/${response.data.id}`;
      }
    } catch (error) {
      console.error("Erro ao enviar o formulário:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    console.log("Ação de cancelar.");
    console.log("Linhas atuais de upload:", uploadLines);
    window.location.href = `/requests`
  };

  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.typeContainer}>
          <label className={styles.textForm}>Edital</label>
          <div>
            {selectedNotice ? (
              <span key={selectedNotice.id}>
                {selectedNotice.number} - {new Date(selectedNotice.documentation_submission_start).toLocaleDateString()}{" "}
                a {new Date(selectedNotice.documentation_submission_end).toLocaleDateString()}{" "}
              </span>
            ) : (
              <span>Nenhum edital vigente no momento.</span>
            )}
          </div>
        </div>
        <div className={styles.typeContainer}>
          <label className={styles.textForm}>Tipo:</label>
          <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className={styles.selectForm}>
            <option value="">Selecione</option>
            <option value="certificacao">Certificação de Conhecimento</option>
            <option value="aproveitamento">Aproveitamento de Estudos</option>
          </select>
        </div>
        {requestType === "certificacao" && (
          <div className={styles.typeContainer}>
            <span> Preencha e envie sua documentacao, de acordo com o item 3.2 do Edital. Preencher com a
              nomenclatura correta das componente curricular.</span>
          </div>
        )}
        {requestType === "aproveitamento" && (
          <div className={styles.typeContainer}>
            <span> Preencha e envie sua documentacao, de acordo com o item 2.2 do Edital. Preencher com a
              nomenclatura correta das componente curricular.</span>
          </div>
        )}
        <div className={styles.typeContainer}>
          <label className={styles.textForm}>Curso</label>
          <span key={selectedCourse.id}> {selectedCourse.name}</span>
        </div>
        <div className={styles.typeContainer}>
          <label className={styles.textForm}>PPC</label>
          <select value={selectedPpc} onChange={handlePpcChange} className={styles.selectForm} required>
            <option value="">Selecione um PPC</option>
            {ppc
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        <div className={styles.typeContainer}>
          {requestType === "certificacao" ? (
            <label className={styles.textForm}>Componente curricular em que solicita certificação.</label>
          ) : (
            <label className={styles.textForm}>Componente curricular do IFRS em que solicita aproveitamento.</label>
          )}
          <select
            value={disciplineId}
            onChange={(e) => setDisciplineId(e.target.value)}
            className={styles.selectForm}
            disabled={!selectedCourse}
            required
          >
            <option value="">Selecione uma disciplina</option>
            {disciplines
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
          </select>
        </div>
        {requestType === "certificacao" && (
          <div className={styles.typeContainer}>
            <label className={styles.textForm}>Experiência (s), Formação, Atividade(s) anteriores.</label>
            <textarea
              value={previousKnowledge}
              onChange={(e) => setPreviousKnowledge(e.target.value)}
              placeholder="Descreva seu conhecimento anterior..."
              className={styles.selectForm}
              required
            />
          </div>
        )}
        {requestType === "aproveitamento" && (
          <div className={styles.typeContainer}>
            <label className={styles.textForm}>Componente curricular(s) cursada(s) anteriormente:</label>
            <textarea
              value={previousCourse}
              onChange={(e) => setPreviousCourse(e.target.value)}
              placeholder="Nome do curso cursado anteriormente.."
              className={styles.selectForm}
              required
            />
            <label className={styles.textForm}>Carga Horaria do componente cursado anteriormente</label>
            <input
              type="number"
              value={courseStudiedWorkload}
              onChange={(e) => setCourseStudiedWorkload(e.target.value)}
              placeholder="Carga horária em horas"
              className={styles.selectForm}
              required
            />
            <label className={styles.textForm}>Nota obtida no componente cursado anteriormente</label>
            <input
              type="number"
              value={courseWorkload}
              onChange={(e) => setCourseWorkload(e.target.value)}
              placeholder="Nota obtida"
              className={styles.selectForm}
              required
            />
          </div>
        )}
        <div className={styles.typeContainer}>
          {requestType === "certificacao" ? (
            <label htmlFor="anexos" className={styles.textForm}>Anexe os comprovantes, conforme item 3.2.1, alinea "b" do Edital.</label>
          ) : (
            <label htmlFor="anexos" className={styles.textForm}>Anexe os comprovantes, conforme item 2.2.1, alinea "b" do Edital.</label>
          )}
          {uploadLines.map((line) => (
            <div key={line.id} style={{ display: "flex", alignItems: "center" }}>
              <FileUpload
                name="singleAttachment"
                mode="basic"
                accept="application/pdf,image/png,image/jpeg"
                maxFileSize={500000000}
                chooseLabel="Selecionar arquivo"
                className={styles.fileInput}
                onSelect={(e) => handleFileSelect(line.id, e)}
                auto={false}
                customUpload={true}
              />
              <Button
                type="button"
                className={styles.xButton}
                style={{ marginLeft: "0.5rem", marginBottom: "1 rem" }}
                onClick={() => removeUploadLine(line.id)}
              >
                X
              </Button>
            </div>
          ))}
          <div className={styles.addButtonContainer}>
            <button type="button" onClick={addUploadLine} className={styles.addButton}>
              <i className="pi pi-plus" style={{ fontSize: "1.5rem", color: "#ffff" }}></i>
            </button>
          </div>
        </div>
        <div className={styles.formBtnContainer}>
          <Button variant="cancel" className={styles.cancelButton} onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant="save"
            onClick={handleSubmit}
            disabled={!selectedNotice || isCreating}
            className={!selectedNotice && styles.btnDisabled}
          >
            {isCreating &&
              <FontAwesomeIcon icon={faSpinner} spin size="sm" fixedWidth />
            }
            <span>{isCreating ? "Enviando" : " Enviar"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CertificationRequestForm;
