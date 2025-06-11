"use client";
import { toast } from 'react-toastify';
import moment from "moment-timezone";
import { apiClient, baseURL } from "@/libs/api";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { default as Stepper } from "@/components/Stepper/stepper";
import styles from "./details.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faEdit,
  faSave,
  faTimes,
  faAsterisk,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "primereact/button";
import {
  getEnumIndexByValue,
  getFailed,
  getStatus,
  getStep1Status,
  getStep2Status,
  getStep3Status,
  getStep4Status,
  getStep5Status,
  getStep6Status,
  getSucceeded,
  StatusEnum,
} from "@/app/requests/status";
import RequestService from "@/services/RequestService";
import { TextField } from "@mui/material";
import Modal from "@/components/Modal/ModalRequest/modal";
import { FileUpload } from "primereact/fileupload";

const Details = () => {
  const [details, setDetails] = useState(null);
  const [stepsStatus, setStepsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false);
  const [isEditingCourseWorkload, setisEditingCourseWorkload] = useState(false);
  const [isEditingCourseStudiedWorkload, setIsEditingCourseStudiedWorkload] =
    useState(false);
  const [isEditingTestScore, setIsEditingTestScore] = useState(false);
  const [editedKnowledge, setEditedKnowledge] = useState("");
  const [editedCourseWorkload, setEditedCourseWorkload] = useState("");
  const [editedSchedulingDate, setEditedSchedulingDate] = useState("");
  const [editedCourseStudiedWorkload, setEditedCourseStudiedWorkload] =
    useState("");
  const [professor, setProfessor] = useState("");
  const [currentResponsible, setCurrentResponsible] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [availableProfessors, setAvailableProfessors] = useState([]);
  const [coordinatorResponsible, setCoordinatorResponsible] = useState("");
  const [step2FinalStepDate, setStep2FinalStepDate] = useState("");
  const [step3FinalStepDate, setStep3FinalStepDate] = useState("");
  const [step4FinalStepDate, setStep4FinalStepDate] = useState("");
  const [coordinatorFeedback, setCoordinatorFeedback] = useState("");
  const [professorFeedback, setProfessorFeedback] = useState("");
  const [coordinatorSecondFeedback, setCoordinatorSecondFeedback] = useState("");
  const [creFeedback, setCreFeedback] = useState("");
  const [endRequest, setEndRequest] = useState("");
  const [editedTestScore, setEditedTestScore] = useState("");
  const [hasChangesKnowledge, setHasChangesKnowledge] = useState(false);
  const [hasChangesWorkload, setHasChangesWorkload] = useState(false);
  const [hasChangesStudiedWorkload, setHasChangesStudiedWorkload] =
    useState(false);
  const [hasChangesTestScore, setHasChangesTestScore] = useState(false);
  const [disableReactivity, setDisableReactivity] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const role = user.type;
  const editableRef = useRef(null);
  const segments = pathname.split("/");
  const id = segments.at(-1);
  const type = segments.at(-2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("pending");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [testDate, setTestDate] = useState(null);
  const [testAttachment, setTestAttachment] = useState(null);

  const [uploadAttachmentLines, setUploadAttachmentLines] = useState([]);
  const attachmentIdCounterRef = useRef(1);

  const addAttachmentLine = () => {
    attachmentIdCounterRef.current += 1;
    setUploadAttachmentLines((prev) => [
      ...prev,
      { id: attachmentIdCounterRef.current, file: null },
    ]);
  };

  const removeAttachmentLine = (lineId) => {
    setUploadAttachmentLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const handleAttachmentFileSelect = async (lineId, event) => {
    const file = event.files && event.files.length > 0 ? event.files[0] : null;
    if (file) {
      await handleSave("test_attachment", file);
      setUploadAttachmentLines((prev) => prev.filter((line) => line.id !== lineId));
      await fetchDetails();
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await apiClient.get(`${baseURL}/forms/${type}/${id}/`);
      if (response.status !== 200) throw new Error("Erro ao buscar detalhes");
      const data = await response.data;
      setDetails(data);
      setTestDate(
        data.scheduling_date
          ? moment(data.scheduling_date).tz("America/Sao_Paulo")
          : null,
      );
      setTestAttachment(
        Array.from(data.attachments).findLast(
          (attachment) => attachment.is_test_attachment,
        ),
      );
      setStepsStatus([
        getStepStatus(data.steps, getStep1Status),
        getStepStatus(data.steps, getStep2Status),
        getStepStatus(data.steps, getStep3Status),
        getStepStatus(data.steps, getStep4Status),
        getStepStatus(data.steps, getStep5Status),
      ]);
      setEditedKnowledge((prev) =>
        prev ? prev : data.previous_knowledge || "",
      );
      setEditedCourseWorkload((prev) =>
        prev ? prev : data.course_workload || "",
      );
      setEditedCourseStudiedWorkload((prev) =>
        prev ? prev : data.course_studied_workload || "",
      );
      setEditedTestScore((prev) =>
        prev !== "" ? prev : data.test_score || "",
      );

      const step2Feedback = getStepStatus(data.steps, getStep2Status);
      const step3Feedback = getStepStatus(data.steps, getStep3Status);
      const step4Feedback = getStepStatus(data.steps, getStep4Status);
      const step5Feedback = getStepStatus(data.steps, getStep5Status);
      const step6Date = getStepStatus(data.steps, getStep6Status);

      if (step2Feedback) {
        setCoordinatorFeedback(step2Feedback.feedback);
        setCoordinatorResponsible(step2Feedback.responsible.name);
        setStep2FinalStepDate(step2Feedback.final_step_date);
      }
      if (step3Feedback) {
        setProfessor(step3Feedback.responsible.name);
        setProfessorFeedback(step3Feedback.feedback);
        setStep3FinalStepDate(step3Feedback.final_step_date);
      }
      if (step4Feedback) {
        setCoordinatorSecondFeedback(step4Feedback.feedback);
        setStep4FinalStepDate(step4Feedback.final_step_date);
      }
      if (step5Feedback) setCreFeedback(step5Feedback.initial_step_date);
      if (step6Date) setEndRequest(step6Date.initial_step_date);

      if (
        role === "Coordenador" &&
        data.status_display === "Em análise do Coordenador"
      ) {
        console.log("user id - " + user.id);
        const professorsResponse = await apiClient.get(
          `${baseURL}/courses/professors/${user.id}`,
        );
        if (professorsResponse.status !== 200)
          throw new Error("Erro ao buscar detalhes");

        const professorsData = await professorsResponse.data;
        setAvailableProfessors(professorsData);
        console.log("professors data - " + professorsData);
      }
      const stepAtual = data.steps.find(step => step.current === true);
      if (stepAtual && stepAtual.responsible && stepAtual.responsible.id) {
        if (stepAtual.responsible.id === user.id) {
          setCurrentResponsible(true);
          console.log("Usuário é responsável pela etapa atual");
        }else {
          setCurrentResponsible(false);
          console.log("Usuário não é responsável pela etapa atual");
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!disableReactivity && id && type) {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [pathname, disableReactivity]);

  const getStepStatus = (stepArray, stepStatusFunc) => {
    const reverseArray = (stepArray) => [...stepArray].reverse();
    return reverseArray(stepArray).find((value) =>
      stepStatusFunc().includes(value.status_display),
    );
  };

  const formatDate = (date) => {
    <p className={styles.info}>
      {date ? (
        <>
          <strong>Finalizado em </strong>
          {new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })}
          {" - "}
          {new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Sao_Paulo"
          })}
        </>
      ) : (
        "Pendente"
      )}
    </p>
  }

  const requestType = () => {
       return type === "knowledge-certifications"
          ? "Certificação de conhecimento"
          : "Aproveitamento de estudos";
    }
  const createStep = async (status, feedback) => {
    try {
      const formType =
        type === "knowledge-certifications"
          ? "certification_form"
          : "recognition_form";

      const body = {
        status: status,
        feedback: [feedback].toString(),
        [formType]: details.id,
      };

      if (status === "PROF") {
        body.responsible_id = Number(selectedProfessor);
      }

      const response = await apiClient.post(
        `${baseURL}/forms/steps/`,
        JSON.stringify(body),
      );

      if (response.status !== 201)
        throw new Error("Erro ao alterar solicitação");

      await fetchDetails();
    } catch (error) {
      setError(error.message);
    }
  };

  const openCancelModal = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  const handleSelectedProfessor = async (prof) => {
    setSelectedProfessor(prof);
  };

  const openModal = (status) => {
    setStatus(status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = (feedback) => {
    let fb;
    if (feedback) {
      fb = feedback.toString();
    }
    createStep(getStatus(status), fb).then((value) => {
      if (
        getSucceeded().includes(status) &&
        status !== "Finalizado e divulgado"
      ) {
        const index = getEnumIndexByValue(status) + 1;
        createStep(getStatus(StatusEnum[index]), "Pendente");
      }
      if (getFailed().includes(status)) {

        if (status == "Rejeitado pelo Professor") {
          const index = getEnumIndexByValue(status) + 2;
          createStep(getStatus(StatusEnum[index]), "Pendente");
        }
        if (status == "Cancelado pelo Coordenador") {
          const index = getEnumIndexByValue(status) + 5;
          createStep(getStatus(StatusEnum[index]), "Pendente");
        }
      }

    });
    console.log("Feedback enviado:", feedback);
    closeModal();
  };

  const handleDownloadAttachment = (attachmentId) => {
    RequestService.DownloadAttachment(attachmentId);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    await RequestService.DeleteAttachment(attachmentId);
  };

  const handleEditToggleKnowledge = () => {
    setIsEditingKnowledge(!isEditingKnowledge);
    setDisableReactivity(!isEditingKnowledge);
  };
  const handleEditToggleCourseWorkload = () => {
    setisEditingCourseWorkload(!isEditingCourseWorkload);
    setDisableReactivity(!isEditingCourseWorkload);
  };
  const handleEditToggleCourseStudiedWorkload = () => {
    setIsEditingCourseStudiedWorkload(!isEditingCourseStudiedWorkload);
    setDisableReactivity(!isEditingCourseStudiedWorkload);
  };
  const handleEditToggleTestScore = () => {
    setIsEditingTestScore(!isEditingTestScore);
    setDisableReactivity(!isEditingTestScore);
  };

  const handleInput = (e, field) => {
    let newValue = e.target.textContent;

    if (
      field === "course_workload" ||
      field === "course_studied_workload" ||
      field === "test_score"
    ) {
      newValue = newValue.replace(/[^0-9]/g, "");
      e.currentTarget.textContent = newValue;
    }

    if (newValue.length > 255) {
      newValue = newValue.slice(0, 255);
      e.currentTarget.textContent = newValue;
    }

    if (field === "previous_knowledge") {
      setEditedKnowledge(newValue);
      if (newValue !== details.previous_knowledge) {
        setHasChangesKnowledge(true);
      }
    } else if (field === "course_workload") {
      setEditedCourseWorkload(newValue);
      if (newValue !== details.course_workload) {
        setHasChangesWorkload(true);
      }
    } else if (field === "course_studied_workload") {
      setEditedCourseStudiedWorkload(newValue);
      if (newValue !== details.course_studied_workload) {
        setHasChangesStudiedWorkload(true);
      }
    } else if (field === "test_score") {
      setEditedTestScore(newValue);
      if (newValue !== details.test_score) {
        setHasChangesTestScore(true);
      }
    }
  };

  const handleSave = async (field, file) => {
    try {
      let response;

      if (field === "test_attachment") {
        const formData = new FormData();
        formData.append(field, file);

        response = await apiClient.patch(
          `${baseURL}/forms/${type}/${id}/`,
          formData,
        );
  
        if (response.status !== 200) throw new Error("Erro ao salvar alterações");
        setDetails((prevDetails) => ({
          ...prevDetails,
        }));
      } else {
        let updatedData;
        switch (field) {
          case "previous_knowledge":
            updatedData = { previous_knowledge: editedKnowledge };
            break;
          case "course_workload":
            updatedData = { course_workload: editedCourseWorkload };
            break;
          case "course_studied_workload":
            updatedData = {
              course_studied_workload: editedCourseStudiedWorkload,
            };
            break;
          case "test_score":
            updatedData = { test_score: Number(editedTestScore) };
            break;
          case "scheduling_date":
            updatedData = { scheduling_date: editedSchedulingDate };
            break;
        }
        response = await apiClient.patch(
          `${baseURL}/forms/${type}/${id}/`,
          updatedData,
        );
        if (response.status !== 200) throw new Error("Erro ao salvar alterações");
  
        setDetails((prevDetails) => ({
          ...prevDetails,
          ...updatedData,
        }));
      }
      switch (field) {
        case "previous_knowledge":
          setHasChangesKnowledge(false);
          setIsEditingKnowledge(false);
          break;
        case "course_workload":
          setHasChangesWorkload(false);
          setisEditingCourseWorkload(false);
          break;
        case "course_studied_workload":
          setHasChangesStudiedWorkload(false);
          setIsEditingCourseStudiedWorkload(false);
          break;
        case "test_score":
          setHasChangesTestScore(false);
          setIsEditingTestScore(false);
          break;
        case "scheduling_date":
          setTestDate(
            moment(response.data.scheduling_date).tz("America/Sao_Paulo"),
          );
        case "test_attachment":
          setTestAttachment(
            Array.from(response.data.attachments).findLast(
              (attachment) => attachment.is_test_attachment,
            )
          );
      }

      setDisableReactivity(false);
      setEditedKnowledge("");
      setEditedCourseWorkload("");
      setEditedSchedulingDate("");
      setEditedCourseStudiedWorkload("");
      setEditedTestScore("");
    } catch (error) {
      let erro = Object.values(error.response.data) 
      toast.error(erro[0][0]);
    }
  };

  const handleBack = () => {
    router.push("/requests");
  };

  const getStatusProps = (step) => {
    let status = stepsStatus[step];

    if (status) status = status.status_display;
    if (getFailed().includes(status)) {
      return { color: "red", icon: faTimes, label: "Rejeitado" };
    } else if (getSucceeded().includes(status)) {
      if (status === "Encaminhado para o Coordenador") {
        return { color: "green", icon: faCheck, label: "Encaminhado" };
      }
      return { color: "green", icon: faCheck, label: "Aprovado" };
    } else {
      return { color: "yellow", icon: faClock, label: "Pendente" };
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDateChange = (e) => {
    const { value } = e.target;
    setEditedSchedulingDate(value);
  };

  const onFileSelect = (e) => {
    handleSave("test_attachment", e.files[0]);
  };

  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.center_title}>{requestType()}</h1>
        {details ? (
          <div>
            {stepsStatus && details.status_display !== "Cancelado" ? (
              <Stepper stepsStatus={stepsStatus} />
            ) : (
              <div className={styles.centered}>
                <div className={`${styles.statusContainer} ${styles.red}`}>
                  <strong>Status: </strong>
                  <div className={styles.statusButton}>
                    <FontAwesomeIcon icon={faTimes} />
                    {"Cancelado pelo aluno"}
                  </div>
                </div>
              </div>
            )}
            {role === "Estudante" &&
              details.status_display === "Solicitação criada" && (
                <div className={styles.centered}>
                  <Button
                    label="Cancelar solicitação"
                    icon="pi pi-times"
                    onClick={openCancelModal}
                    className={styles.pButtonDanger}
                  />
                </div>
              )}
            {showCancelModal && (
              <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                  <h3>Confirmar Cancelamento</h3>
                  <p>Você tem certeza que deseja cancelar sua solicitação?</p>
                  <div className={styles.modalButtons}>
                    <button
                      className={styles.confirmButton}
                      onClick={() => {
                        createStep("CANCELED");
                        closeCancelModal();
                      }}
                    >
                      Sim
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={closeCancelModal}
                    >
                      Não
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.analysis}>
              <h1 className={styles.center_title}>Análise do Ensino</h1>
              <div className={styles.columns}>
                <div className={styles.infoColumn}>
                  <p className={styles.info}>
                    <strong>Aluno: </strong>
                    {details.student_name}
                  </p>
                  <p className={styles.info}>
                    <strong>E-mail: </strong>
                    {details.student_email}
                  </p>
                  <p className={styles.info}>
                    <strong>Matrícula: </strong>
                    {details.student_matricula}
                  </p>
                  <p className={styles.info}>
                    <strong>Curso: </strong>
                    {details.student_course}
                  </p>
                  <p className={styles.info}>
                    <strong>Componente curricular: </strong>
                    {details.discipline_name}
                  </p>
                  <p className={styles.info}>
                    <strong>Carga horária: </strong>
                    {details.discipline_workload}
                  </p>
                  {role === "Estudante" && details.status_display === "Solicitação criada" ? (
                    <div className={styles.attachmentsSection}>
                      <h3>Anexos</h3>
                      {details.attachments && details.attachments.length > 0 && (
                        <ul className={styles.attachmentsList}>
                          {details.attachments
                            .filter((attachment) => !attachment.is_test_attachment)
                            .map((attachment) => (
                              <li
                                key={attachment.id}
                                className={styles.attachmentItem}
                              >
                                <div className={styles.attachmentItemContent}>
                                  <strong>{attachment.file_name}</strong>
                                  <div>
                                    <Button
                                      icon="pi pi-download"
                                      className="p-button-sm p-button-outlined"
                                      onClick={() => handleDownloadAttachment(attachment.id)}
                                      tooltip="Visualizar Anexo"
                                      style={{ marginRight: "8px" }}
                                    />
                                    <Button
                                      icon="pi pi-trash"
                                      className="p-button-sm p-button-danger p-button-outlined"
                                      onClick={async () => {
                                        await handleDeleteAttachment(attachment.id);
                                        await fetchDetails();
                                      }}
                                      tooltip="Excluir Anexo"
                                    />
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    details.attachments &&
                    details.attachments.length > 0 && (
                      <div className={styles.attachmentsSection}>
                        <h3>Anexos</h3>
                        <ul className={styles.attachmentsList}>
                          {details.attachments
                            .filter((attachment) => !attachment.is_test_attachment)
                            .map((attachment) => (
                              <li key={attachment.id} className={styles.attachmentItem}>
                                <div className={styles.attachmentItemContent}>
                                  <strong>{attachment.file_name}</strong>
                                  <Button
                                    icon="pi pi-download"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => handleDownloadAttachment(attachment.id)}
                                    tooltip="Visualizar Anexo"
                                  />
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )
                  )}

                  {type === "knowledge-certifications" && (
                    <div className={styles.infoField}>
                      <strong className={styles.info}>
                        Experiência anterior:{" "}
                      </strong>
                      <span
                        ref={editableRef}
                        contentEditable={isEditingKnowledge}
                        suppressContentEditableWarning={true}
                        className={`${styles.editableSpan} ${isEditingKnowledge ? styles.editing : ""}`}
                        onInput={(e) => handleInput(e, "previous_knowledge")}
                      >
                        {details.previous_knowledge || "Pendente"}
                      </span>
                      {/*role === "Estudante" &&
                        details.status_display === "Solicitação criada" && (
                          <>
                            <FontAwesomeIcon
                              icon={faEdit}
                              onClick={handleEditToggleKnowledge}
                              className={`${styles.iconSpacing} ${styles.editIcon}`}
                            />
                            {isEditingKnowledge && hasChangesKnowledge && (
                              <FontAwesomeIcon
                                icon={faSave}
                                onClick={() => handleSave("previous_knowledge")}
                                className={`${styles.iconSpacing} ${styles.saveIcon}`}
                              />
                            )}
                          </>
                        )*/}
                    </div>
                  )}

                  {type === "recognition-forms" && (
                    <>
                      <p className={styles.info}>
                        <strong>Cursado anteriormente: </strong>
                        {details.previous_course || "Pendente"}
                      </p>
                      <p className={styles.info}>
                        <strong>Carga horária cursado anteriormente: </strong>
                        {details.course_studied_workload || "Pendente"}
                      </p>
                      <p className={styles.info}>
                        <strong>Nota obtida: </strong>
                        {details.course_workload || "Pendente"}
                      </p>
                    </>
                  )}
                </div>
                {details.status_display !== "Cancelado" && (
                  <div className={styles.actionColumn}>
                    <div
                      className={`${styles.statusContainer} ${styles[getStatusProps(0).color]}`}
                    >
                      <strong>Status: </strong>
                      <div className={styles.statusButton}>
                        <FontAwesomeIcon icon={getStatusProps(0).icon} />
                        {getStatusProps(0).label}
                      </div>
                    </div>

                    {role === "Ensino" &&
                      details.status_display === "Solicitação criada" && (
                        <div className={styles.actionButtons}>
                          <Button
                            label="Encaminhar para o coordenador"
                            icon="pi pi-check"
                            onClick={() => openModal("Encaminhado para o Coordenador")}
                            className={styles.pButtonSuccess}
                          />
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
            {Object.values(details.steps)
              .reverse()
              .find((value) =>
                getStep2Status().includes(value.status_display),
              ) && (
                <div className={styles.analysis}>
                  <h1 className={styles.center_title}>Análise do Coordenador</h1>
                  <div className={styles.columns}>
                    <div className={styles.infoColumn}>
                      <p className={styles.info}>
                        <strong>Coordenador responsável: </strong>
                        {coordinatorResponsible || ""}
                      </p>
                      {role === "Coordenador" &&
                        details.status_display === "Em análise do Coordenador" ? (
                        <div className={styles.selector_container}>
                          <p className={styles.info}>
                            <strong>Professor responsável: </strong>
                            {professor || ""}
                          </p>
                          <select
                            className={styles.selector}
                            onChange={(e) =>
                              handleSelectedProfessor(e.target.value)
                            }
                          >
                            <option value="">Selecione um Professor</option>
                            {availableProfessors.map((prof) => (
                              <option key={prof.id} value={prof.id}>
                                {prof.name}
                              </option>
                            ))}
                          </select>
                          <FontAwesomeIcon
                            icon={faAsterisk}
                            className={`${styles.iconSpacing} ${styles.asterisk}`}
                          />
                        </div>
                      ) : (
                        <p className={styles.info}>
                          <strong>Professor designado: </strong>
                          {professor || ""}
                        </p>
                      )}
                    <p className={styles.info}>
                      <strong>Parecer do coordenador: </strong>
                      {coordinatorFeedback || "Pendente"}
                    </p>
                    <p className={styles.info}>
                      {step2FinalStepDate && (
                        <>
                          <strong>Analisado em </strong>
                          {new Date(step2FinalStepDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                          {" - "}
                          {new Date(step2FinalStepDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Sao_Paulo"
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <div className={styles.actionColumn}>
                    {details.status_display !== "Cancelado" && (
                      <div
                        className={`${styles.statusContainer} ${styles[getStatusProps(1).color]}`}
                      >
                        <strong>Status: </strong>
                        <div className={styles.statusButton}>
                          <FontAwesomeIcon icon={getStatusProps(1).icon} />
                          {getStatusProps(1).label}
                        </div>
                      </div>
                    )}
                    {role === "Coordenador" &&
                      details.status_display === "Em análise do Coordenador" && (
                        <div className={styles.actionButtons}>
                          {selectedProfessor && (
                            <Button
                              label="Aprovar"
                              icon="pi pi-check"
                              onClick={() =>
                                openModal("Analisado pelo Coordenador")
                              }
                              className={styles.pButtonSuccess}
                            />
                          )}
                          <Button
                            label="Rejeitar"
                            icon="pi pi-times"
                            onClick={() =>
                              openModal("Cancelado pelo Coordenador")
                            }
                            className={styles.pButtonDanger}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
            {Object.values(details.steps)
              .reverse()
              .find((value) =>
                getStep3Status().includes(value.status_display),
              ) && (
              <div className={styles.analysis}>
                <h1 className={styles.center_title}>Análise do Professor</h1>
                <div className={styles.columns}>
                  <div className={styles.infoColumn}>
                    {type === "knowledge-certifications" &&
                      !details.scheduling_date &&
                      currentResponsible && (
                        <div className={styles.date_time_container}>
                          <p className={styles.info}>
                            <strong>Agendar prova: </strong>
                          </p>
                          <TextField
                            className={styles.date_time}
                            type="datetime-local"
                            name="schedulingDate"
                            value={editedSchedulingDate}
                            onChange={handleDateChange}
                            fullWidth
                            slotProps={{
                              htmlInput: {
                                min: new Date(
                                  new Date().getTime() + 24 * 60 * 60 * 1000,
                                )
                                  .toISOString()
                                  .slice(0, 16),
                              },
                            }}
                          />
                          {editedSchedulingDate !== "" && (
                            <div className={styles.iconSpacing}>
                              <FontAwesomeIcon
                                icon={faSave}
                                onClick={() => handleSave("scheduling_date")}
                                className={`${styles.iconSpacing} ${styles.saveIcon}`}
                              />
                              <span
                                className={styles.saveIcon}
                                onClick={() => handleSave("scheduling_date")}
                              >
                                Agendar
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    {type === "knowledge-certifications" && (
                      <p className={styles.info}>
                        <strong>Data da prova: </strong>
                        {details.scheduling_date
                          ? new Date(details.scheduling_date).toLocaleString(
                              "pt-BR",
                            )
                          : "Pendente"}
                      </p>
                    )}

                    {type === "knowledge-certifications" && testDate && (
                      <p className={styles.info}>
                        <strong>Avaliação: </strong>
                        <span
                          ref={editableRef}
                          contentEditable={isEditingTestScore}
                          suppressContentEditableWarning={true}
                          className={`${styles.editableSpan} ${isEditingTestScore ? styles.editing : ""}`}
                          onInput={(e) => handleInput(e, "test_score")}
                        >
                          {details.test_score || "Pendente"}
                        </span>
                        { currentResponsible &&
                          (details.status_display ===
                            "Em análise do Professor" ||
                            details.status_display ===
                              "Retornado pelo Coordenador") && (
                            <>
                              <FontAwesomeIcon
                                icon={faEdit}
                                onClick={handleEditToggleTestScore}
                                className={`${styles.iconSpacing} ${styles.editIcon}`}
                              />
                              {isEditingTestScore && hasChangesTestScore && (
                                <FontAwesomeIcon
                                  icon={faSave}
                                  onClick={() => handleSave("test_score")}
                                  className={`${styles.iconSpacing} ${styles.saveIcon}`}
                                />
                              )}
                            </>
                          )}
                      </p>
                    )}
                    {type === "knowledge-certifications" && testDate && (
                        <div className={styles.info}>
                          <strong>Prova: </strong>
                          {(details.status_display === "Em análise do Professor" ||
                            details.status_display === "Retornado pelo Coordenador") &&
                            currentResponsible ? (
                            <>
                              <FileUpload
                                name="prova"
                                mode="basic"
                                auto={false}
                                accept="application/pdf,image/png,image/jpeg"
                                maxFileSize={5000000}
                                label="Upload da prova"
                                className="p-button-sm p-button-outlined"
                                style={{
                                  marginBottom: "10px",
                                  marginTop: "5px",
                                  padding: "10px",
                                }}
                                onSelect={(e) => onFileSelect(e)}
                              />
                            </>
                          ) :
                            testAttachment && testAttachment.id ? (
                              <div
                                key={testAttachment.id}
                                className={styles.attachmentItem}
                              >
                                <div className={styles.attachmentItemContent}>
                                  <span>{testAttachment.file_name}</span>
                                  <Button
                                    icon="pi pi-download"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() =>
                                      handleDownloadAttachment(testAttachment.id)
                                    }
                                    tooltip="Visualizar Prova"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className={styles.attachmentItem}>
                                <div className={styles.attachmentItemContent}>
                                  <span>Pendente</span>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    <p className={styles.info}>
                      <strong>Parecer: </strong>
                      {professorFeedback || "Pendente"}
                    </p>
                    <p className={styles.info}>
                      {step3FinalStepDate && (
                        <>
                          <strong>Decisão em </strong>
                          {new Date(step3FinalStepDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                          {" - "}
                          {new Date(step3FinalStepDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Sao_Paulo"
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <div className={styles.actionColumn}>
                    {details.status_display !== "Cancelado" && (
                      <div
                        className={`${styles.statusContainer} ${styles[getStatusProps(2).color]}`}
                      >
                        <strong>Status: </strong>
                        <div className={styles.statusButton}>
                          <FontAwesomeIcon icon={getStatusProps(2).icon} />
                          {getStatusProps(2).label}
                        </div>
                      </div>
                    )}
                    {(details.status_display === "Em análise do Professor" ||
                      details.status_display === "Retornado pelo Coordenador") &&
                      currentResponsible && 
                      (type !== "knowledge-certifications" ||
                        (type === "knowledge-certifications" &&
                          testAttachment &&
                          details.test_score &&
                          details.scheduling_date)) && (
                        <div className={styles.actionButtons}>
                          <Button
                            label="Aprovar"
                            icon="pi pi-check"
                            onClick={() => openModal("Analisado pelo Professor")}
                            className={styles.pButtonSuccess}
                          />
                          <Button
                            label="Rejeitar"
                            icon="pi pi-times"
                            onClick={() => openModal("Rejeitado pelo Professor")}
                            className={styles.pButtonDanger}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
            {Object.values(details.steps)
              .reverse()
              .find((value) =>
                getStep4Status().includes(value.status_display),
              ) && (
              <div className={styles.analysis}>
                <h1 className={styles.center_title}>
                  Homologação do Coordenador
                </h1>
                <div className={styles.columns}>
                  <div className={styles.infoColumn}>
                    <p className={styles.info}>
                      <strong>Parecer: </strong>
                      {coordinatorSecondFeedback || "Pendente"}
                    </p>
                    <p className={styles.info}>
                      {step4FinalStepDate && (
                        <>
                          <strong>Analisado em </strong>
                          {new Date(step4FinalStepDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                          {" - "}
                          {new Date(step4FinalStepDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Sao_Paulo"
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <div className={styles.actionColumn}>
                    {details.status_display !== "Cancelado" && (
                      <div
                        className={`${styles.statusContainer} ${styles[getStatusProps(3).color]}`}
                      >
                        <strong>Status: </strong>
                        <div className={styles.statusButton}>
                          <FontAwesomeIcon icon={getStatusProps(3).icon} />
                          {getStatusProps(3).label}
                        </div>
                      </div>
                    )}
                    {(details.status_display ===
                      "Em homologação do Coordenador" ||
                      details.status_display === "Retornado pelo Ensino") &&
                      role === "Coordenador" && currentResponsible && (
                        <div className={styles.actionButtons}>
                          <Button
                            label="Aprovar"
                            icon="pi pi-check"
                            onClick={() => openModal("Homologado pelo Coordenador")}
                            className={styles.pButtonSuccess}
                          />
                          <Button
                            label="Retornar"
                            icon="pi pi-arrow-left"
                            onClick={() => openModal("Retornado pelo Coordenador")}
                            className={styles.pButtonReturn}
                          />
                          <Button
                            label="Rejeitar"
                            icon="pi pi-times"
                            onClick={() =>
                              openModal("Rejeitado pelo Coordenador")
                            }
                            className={styles.pButtonDanger}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
            {Object.values(details.steps)
              .reverse()
              .find((value) =>
                getStep5Status().includes(value.status_display),
              ) && (
              <div className={styles.analysis}>
                <h1 className={styles.center_title}>Divulgação do Ensino</h1>
                <div className={styles.columns}>
                 <div className={styles.infoColumn}>
                    <p className={styles.info}>
                      {endRequest ? (
                        <>
                          <strong>Finalizado em </strong>
                          {new Date(endRequest).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                          {" - "}
                          {new Date(endRequest).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Sao_Paulo"
                          })}
                        </>
                      ) : (
                        "Pendente"
                      )}
                    </p>
                  </div>
                  <div className={styles.actionColumn}>
                    {details.status_display !== "Cancelado" && (
                      <div
                        className={`${styles.statusContainer} ${styles[getStatusProps(4).color]}`}
                      >
                        <strong>Status: </strong>
                        <div className={styles.statusButton}>
                          <FontAwesomeIcon icon={getStatusProps(4).icon} />
                          {getStatusProps(4).label}
                        </div>
                      </div>
                    )}
                    {role === "Ensino" &&
                      details.status_display === "Em aguardo para divulgação" && (
                        <div className={styles.actionButtons}>
                          <Button
                            label="Aprovar"
                            icon="pi pi-check"
                            onClick={() => openModal("Finalizado e divulgado")}
                            className={styles.pButtonSuccess}
                          />
                          <Button
                            label="Retornar"
                            icon="pi pi-arrow-left"
                            onClick={() => openModal("Retornado pelo Ensino")}
                            className={styles.pButtonReturn}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Nenhum detalhe disponível</div>
        )}
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          onClick={handleBack}
          className={styles.backButton}
        />
      </div>
      {isModalOpen && (
        <Modal
          status={status}
          onClose={closeModal}
          onConfirm={handleConfirm}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default Details;