import React, { useState } from 'react';
import Link from 'next/link';
import styles from './modalPpcSelector.module.css';
import { ppcCreate } from '@/services/PpcService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Button from "@/components/ButtonDefault/button";

const ModalPpcSelector = ({ course, ppcs, onClose, onPpcCreated }) => {

    const [newPpcName, setNewPpcName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    if (!course) return null;

    const handleCreatePpc = async () => {
        if (!newPpcName.trim()) {
            setCreateError("O nome do PPC não pode ser vazio.");
            return;
        }
        setIsCreating(true);
        setCreateError("");
        try {
            await ppcCreate({
                name: newPpcName.trim(),
                course_id: course.id
            });
            setNewPpcName("");
            if (onPpcCreated) {
                onPpcCreated();
            }
        } catch (error) {
             console.error("Erro ao criar PPC:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>PPCs de {course.name}</h2>

                <div className={styles.createSection}>
                    <h3 className={styles.sectionTitle}>Criar Novo PPC</h3>
                    <div className={styles.createForm}>
                        <input
                            type="text"
                            value={newPpcName}
                            onChange={(e) => { setNewPpcName(e.target.value); setCreateError(''); }}
                            placeholder="Nome do novo PPC (Ex: PPC 2025.2)"
                            className={`${styles.createInput} ${createError ? styles.inputError : ''}`}
                            disabled={isCreating}
                            aria-label="Nome do novo PPC"
                        />
                        <Button
                            variant="save"
                            onClick={handleCreatePpc}
                            disabled={isCreating || !newPpcName.trim()}
                            className={styles.createButtonInternal}
                        >
                            {isCreating ? (
                                <FontAwesomeIcon icon={faSpinner} spin size="sm" fixedWidth/>
                            ) : (
                                <FontAwesomeIcon icon={faPlus} size="sm" fixedWidth/>
                            )}
                            <span>{isCreating ? " Criando" : " Criar"}</span>
                        </Button>
                    </div>
                    {createError && (
                        <p className={styles.errorText}>
                            <FontAwesomeIcon icon={faExclamationCircle} /> {createError}
                        </p>
                    )}
                </div>

                <h3 className={styles.listTitle}>PPCs Existentes</h3>
                <div className={styles.listContainer}>
                    {ppcs.length === 0 ? (
                        <p className={styles.infoText}>Nenhum PPC cadastrado.</p>
                    ) : (
                        <ul className={styles.ppcList}>
                            {ppcs.map(ppc => (
                                <li key={ppc.id} className={styles.ppcItem}>
                                    <span className={styles.ppcName}>{ppc.name || `PPC ${ppc.id.substring(0,8)}`}</span>
                                    <Link href={`/courses/ppc/${ppc.id}`} className={styles.editLink} title="Editar disciplinas deste PPC">
                                        Editar Disciplinas
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <Button variant="close" onClick={onClose} disabled={isCreating}>
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ModalPpcSelector;