"use client";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import styles from "./modalNotice.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { noticeCreate, noticeEdit } from "@/services/NoticeService";
import Button from "@/components/ButtonDefault/button";

const ModalNotice = ({ onClose, editData = null, response }) => {
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    number: editData?.number || "",
    publicationDate: formatDate(editData?.publication_date),
    documentationDeadlineFrom: formatDate(editData?.documentation_submission_start),
    documentationDeadlineTo: formatDate(editData?.documentation_submission_end),
    proposalAnalysisFrom: formatDate(editData?.proposal_analysis_start),
    proposalAnalysisTo: formatDate(editData?.proposal_analysis_end),
    resultPublication: formatDate(editData?.result_publication),
    link: editData?.link || "",
    rectifications: editData?.rectifications || [""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      const dateFields = [
        ["documentationDeadlineFrom", "documentationDeadlineTo"],
        ["proposalAnalysisFrom", "proposalAnalysisTo"],
      ];
      dateFields.forEach(([startField, endField]) => {
        if (name === startField && updatedData[endField]) {
          const fromDate = new Date(value);
          const toDate = new Date(updatedData[endField]);
          if (toDate < fromDate) {
            updatedData[endField] = value;
          }
        }
        if (name === endField && updatedData[startField]) {
          const fromDate = new Date(updatedData[startField]);
          const toDate = new Date(value);
          if (toDate < fromDate) {
            updatedData[startField] = value;
          }
        }
      });
      return updatedData;
    });
  };
  const isValidURL = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\\/?$",
      "i"
    );
    return pattern.test(url);
  };

  const handleRectificationChange = (index, value) => {
    setFormData((prev) => {
      const updatedRectifications = [...prev.rectifications];
      updatedRectifications[index] = value;
      return { ...prev, rectifications: updatedRectifications };
    });
  };

  const addRectification = () => {
    setFormData((prev) => ({ ...prev, rectifications: [...prev.rectifications, ""] }));
  };

  useEffect(() => {
    const validateFields = () => {
      const errors = {};
      const requiredFields = [
        "number",
        "publicationDate",
        "documentationDeadlineFrom",
        "documentationDeadlineTo",
        "proposalAnalysisFrom",
        "proposalAnalysisTo",
        "resultPublication",
        "link",
      ];
      requiredFields.forEach((field) => {
        if (!formData[field]?.trim()) {
          errors[field] = "Campo obrigatório";
        }
      });

      const publicationDate = formData.publicationDate ? new Date(formData.publicationDate) : null;
      if (publicationDate) {
        [
          "documentationDeadlineFrom",
          "documentationDeadlineTo",
          "proposalAnalysisFrom",
          "proposalAnalysisTo",
          "resultPublication",
        ].forEach((field) => {
          if (formData[field]) {
            const selectedDate = new Date(formData[field]);
            if (selectedDate < publicationDate) {
              errors[field] = "Data não pode ser anterior à publicação do edital.";
            }
          }
        });
      }
      const docTo = formData.documentationDeadlineTo ? new Date(formData.documentationDeadlineTo) : null;
      const analysisFrom = formData.proposalAnalysisFrom ? new Date(formData.proposalAnalysisFrom) : null;
      if (docTo && analysisFrom && analysisFrom < docTo) {
        errors.proposalAnalysisFrom =
          "A data de início da análise deve ser após o fim da entrega da documentação.";
      }
      if (formData.link && !isValidURL(formData.link)) {
        errors.link = "URL inválida";
      }
      formData.rectifications.forEach((rect, index) => {
        if (rect && !isValidURL(rect)) {
          errors[`rectifications-${index}`] = "URL inválida";
        }
      });
      setFieldErrors(errors);
      setIsFormValid(Object.keys(errors).length === 0);
    };
    validateFields();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      number: formData.number,
      publication_date: `${formData.publicationDate}T00:00:00-03:00`,
      documentation_submission_start: `${formData.documentationDeadlineFrom}T00:00:00-03:00`,
      documentation_submission_end: `${formData.documentationDeadlineTo}T00:00:00-03:00`,
      proposal_analysis_start: `${formData.proposalAnalysisFrom}T00:00:00-03:00`,
      proposal_analysis_end: `${formData.proposalAnalysisTo}T00:00:00-03:00`,
      result_publication: `${formData.resultPublication}T00:00:00-03:00`,
      link: formData.link,
      rectifications: formData.rectifications.filter((link) => link !== ""),
    };
    try {
      if (editData) {
        await noticeEdit(editData.id, payload);
        response("edit");
      } else {
        await noticeCreate(payload);
        response("create");
      }
      onClose();
    } catch {
      response("error");
    }
  };

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>{editData ? "Editar Edital" : "Cadastrar Edital"}</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Número do Edital*</label>
          <TextField
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Ex: 002-2024"
            className={styles.input}
            fullWidth
            error={!!fieldErrors.number}
            helperText={fieldErrors.number}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Data de Publicação do Edital*</label>
          <TextField
            type="date"
            name="publicationDate"
            value={formData.publicationDate}
            onChange={handleChange}
            className={styles.input}
            fullWidth
            error={!!fieldErrors.publicationDate}
            helperText={fieldErrors.publicationDate}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Prazo para Abertura de Solicitações*</label>
          <div className={styles.dateRange}>
            <TextField
              type="date"
              name="documentationDeadlineFrom"
              value={formData.documentationDeadlineFrom}
              onChange={handleChange}
              className={styles.input}
              fullWidth
              error={!!fieldErrors.documentationDeadlineFrom}
              helperText={fieldErrors.documentationDeadlineFrom}
              inputProps={{
                max: formData.documentationDeadlineTo || undefined,
                min: formData.publicationDate || undefined,
              }}
            />
            <span className={styles.toLabel}>até</span>
            <TextField
              type="date"
              name="documentationDeadlineTo"
              value={formData.documentationDeadlineTo}
              onChange={handleChange}
              className={styles.input}
              fullWidth
              error={!!fieldErrors.documentationDeadlineTo}
              helperText={fieldErrors.documentationDeadlineTo}
              inputProps={{
                min:
                  formData.documentationDeadlineFrom || formData.publicationDate || undefined,
                max: formData.proposalAnalysisTo || undefined,
              }}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Prazo para Análise de Solicitações*</label>
          <div className={styles.dateRange}>
            <TextField
              type="date"
              name="proposalAnalysisFrom"
              value={formData.proposalAnalysisFrom}
              onChange={handleChange}
              className={styles.input}
              fullWidth
              error={!!fieldErrors.proposalAnalysisFrom}
              helperText={fieldErrors.proposalAnalysisFrom}
              inputProps={{
                max: formData.proposalAnalysisTo || undefined,
                min:
                  formData.documentationDeadlineTo ||
                  formData.publicationDate ||
                  undefined,
              }}
            />
            <span className={styles.toLabel}>até</span>
            <TextField
              type="date"
              name="proposalAnalysisTo"
              value={formData.proposalAnalysisTo}
              onChange={handleChange}
              className={styles.input}
              fullWidth
              error={!!fieldErrors.proposalAnalysisTo}
              helperText={fieldErrors.proposalAnalysisTo}
              inputProps={{
                min:
                  formData.proposalAnalysisFrom || formData.publicationDate || undefined,
              }}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Resultado*</label>
          <TextField
            type="date"
            name="resultPublication"
            value={formData.resultPublication}
            onChange={handleChange}
            className={styles.input}
            fullWidth
            error={!!fieldErrors.resultPublication}
            helperText={fieldErrors.resultPublication}
            inputProps={{
              min:
                formData.proposalAnalysisTo || formData.publicationDate || undefined,
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Link do Edital*</label>
          <TextField
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="Insira o link do edital"
            className={styles.input}
            fullWidth
            error={!!fieldErrors.link}
            helperText={fieldErrors.link}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Retificações</label>
          {formData.rectifications.map((rect, index) => (
            <div key={index} className={styles.rectRow}>
              <TextField
                type="text"
                value={rect}
                onChange={(e) => handleRectificationChange(index, e.target.value)}
                placeholder="Link da retificação"
                className={styles.input}
                fullWidth
                error={!!fieldErrors[`rectifications-${index}`]}
                helperText={fieldErrors[`rectifications-${index}`]}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() =>
                  setFormData((prev) => {
                    const updated = prev.rectifications.filter((_, i) => i !== index);
                    return { ...prev, rectifications: updated };
                  })
                }
              >
                <FontAwesomeIcon icon={faTrash} size="xs" />
              </button>
            </div>
          ))}
          <Button variant="save" className={styles.addRectButton} onClick={addRectification}>
            Adicionar Retificação
          </Button>
        </div>
        <div className={styles.modalActions}>
          <Button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="save" className={styles.saveButton}
            onClick={handleSubmit}
            disabled={!isFormValid}>
            {editData ? "Salvar Alterações" : "Cadastrar"}
          </Button>

        </div>
      </div>
    </div>
  );
};

export default ModalNotice;
