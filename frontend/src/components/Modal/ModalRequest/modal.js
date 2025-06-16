import React, { useState, useEffect } from "react";
import { getFailed, getSucceeded } from "@/app/requests/status";
import styles from './modalRequest.module.css';
import Button from "@/components/ButtonDefault/button";

const Modal = ({ status, onClose, onConfirm, isOpen }) => {
    const [feedback, setFeedback] = useState("");
    const [isFeedbackValid, setIsFeedbackValid] = useState(true);
    const isSucceeded = getSucceeded().includes(status);
    const isFailed = getFailed().includes(status);

    const getButtonColor = () => {
        if (isSucceeded) return styles.green;
        if (isFailed) return styles.red;
        return styles.yellow;
    };

    const getMessage = () => {
        if (isSucceeded) return "a aprovação";
        if (isFailed) return "a rejeição";
        return "o retorno";
    };

    const handleConfirm = () => {
    let finalFeedback = feedback;

    if (feedback.trim() === "" && isFailed) {
        setIsFeedbackValid(false);
        return;
    } else if (feedback.trim() === "") {
        finalFeedback = "-";
    }
    setFeedback(finalFeedback);
    onConfirm(finalFeedback);
};

    useEffect(() => {
        if (!isOpen) {
            setFeedback("");
            setIsFeedbackValid(true);
        }
    }, [isOpen]);

    return (
        <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
                <h2>Confirme sua decisão sobre {getMessage()} desta etapa da solicitação:</h2>

                <textarea
                    className={styles.textareaFeedback}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={isFailed ? "Parecer obrigatório em rejeições.." : "Parecer opcional.."}
                    required
                    rows={4}
                />
                {!isFeedbackValid && <p style={{ color: "red" }}>*O parecer é obrigatório para rejeições</p>}

                <div className="modalActions">
                    <Button variant="cancel" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="save" className={`${styles.btn} ${getButtonColor()}`} onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
