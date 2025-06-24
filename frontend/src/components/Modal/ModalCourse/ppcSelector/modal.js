import React, { useState } from 'react';
import Link from 'next/link';
import styles from './modalPpcSelector.module.css';
import { ppcCreate, ppcEdit } from '@/services/PpcService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Button from "@/components/ButtonDefault/button";

const ModalPpcSelector = ({ course, ppcs, onClose, onPpcCreated }) => {

    const [newPpcName, setNewPpcName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!course) return null;

    const handleCreatePpc = async () => {
        if (!newPpcName.trim()) {
            setError("O nome do PPC não pode ser vazio.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            await ppcCreate({
                name: newPpcName.trim(),
                course_id: course.id
            });
            setNewPpcName("");
            if (onPpcCreated) {
                onPpcCreated();
            }
        } catch (err) {
            console.error("Erro ao criar PPC:", err);
            setError("Erro ao criar PPC.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleState = async (ppc) => {
        setIsLoading(true);
        setError('');

        try {
            await ppcEdit(ppc.id, { is_active: !ppc.is_active });
            if (onPpcCreated) {
                onPpcCreated();
            }
        } catch (err) {
            console.error("Erro ao alterar estado do PPC:", err);
            setError("Falha ao alterar estado do PPC. Verifique os dados e tente novamente.");
        } finally {
            setIsLoading(false);
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
                            onChange={(e) => { setNewPpcName(e.target.value); setError(''); }}
                            placeholder="Nome do novo PPC (Ex: PPC 2025.2)"
                            className={`${styles.createInput} ${error && error.includes('nome') ? styles.inputError : ''}`}
                            disabled={isLoading}
                            aria-label="Nome do novo PPC"
                        />
                        <Button
                            variant="save"
                            onClick={handleCreatePpc}
                            disabled={isLoading || !newPpcName.trim()}
                            className={styles.createButtonInternal}
                        >
                            {isLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin size="sm" fixedWidth />
                            ) : (
                                <FontAwesomeIcon icon={faPlus} size="sm" fixedWidth />
                            )}
                            <span>{isLoading ? " Processando" : " Criar"}</span>
                        </Button>
                    </div>
                    {error && (
                        <p className={styles.errorText}>
                            <FontAwesomeIcon icon={faExclamationCircle} /> {error}
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
                                <li
                                    key={ppc.id}
                                    className={`${styles.ppcItem} ${!ppc.is_active ? styles.inactivePpcItem : ''}`}
                                >
                                    <span className={styles.ppcName}>{ppc.name || `PPC ${ppc.id.substring(0, 8)}`}</span>
                                    <div className={styles.ppcActions}>
                                        <Link href={`/courses/ppc/${ppc.id}`} className={styles.editLink} title="Editar disciplinas deste PPC">
                                            Editar Disciplinas
                                        </Link>
                                        <Button
                                            className={styles.editLink}
                                            title={`Alterar estado deste PPC para ${ppc.is_active ? 'Inativo' : 'Ativo'}`}
                                            onClick={() => handleState(ppc)}
                                            disabled={isLoading}
                                        >
                                            {ppc.is_active ? 'Desativar' : 'Ativar'}
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <Button variant="close" onClick={onClose} disabled={isLoading}>
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ModalPpcSelector;