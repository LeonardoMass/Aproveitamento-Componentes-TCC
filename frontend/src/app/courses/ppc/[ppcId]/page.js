'use client';
import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ppcGet, ppcEdit } from '@/services/PpcService';
import { DisciplineList, getDisciplineDetailsBatch } from '@/services/DisciplineService';
import styles from './ppc.module.css';
import { Button } from "primereact/button";
import { usePathname, useRouter } from 'next/navigation';

const EditPpcPage = () => {

    const pathname = usePathname();
    const segments = pathname.split("/");
    const ppcId = segments.at(-1);
    const [ppcDetails, setPpcDetails] = useState(null);
    const [selectedDisciplines, setSelectedDisciplines] = useState([]);
    const [availableDisciplines, setAvailableDisciplines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const router = useRouter();

    const loadData = useCallback(async () => {
        if (!ppcId) return;

        setLoading(true);
        setError('');
        setSaveSuccess(false);
        try {
            const [ppcData, allDisciplines] = await Promise.all([
                ppcGet(ppcId),
                DisciplineList()
            ]);

            if (!ppcData) {
                throw new Error("PPC não encontrado.");
            }
            setPpcDetails(ppcData);
            setAvailableDisciplines(allDisciplines || []);

            if (ppcData.disciplines && ppcData.disciplines.length > 0) {
                const initialDisciplineDetails = await getDisciplineDetailsBatch(ppcData.disciplines);
                setSelectedDisciplines(initialDisciplineDetails);
            } else {
                setSelectedDisciplines([]);
            }

        } catch (err) {
            console.error("Erro ao carregar dados da página de edição do PPC:", err);
            setError(err.message || "Falha ao carregar dados.");
            setPpcDetails(null);
        } finally {
            setLoading(false);
        }
    }, [ppcId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddDiscipline = (disciplineId) => {
        if (!disciplineId) return;
        const disciplineIdStr = String(disciplineId);
        const disciplineToAdd = availableDisciplines.find(d => String(d.id) === disciplineIdStr);

        if (disciplineToAdd && !selectedDisciplines.some(sd => sd.id === disciplineToAdd.id)) {
            setSelectedDisciplines(prev => [...prev, disciplineToAdd]);
            setSaveSuccess(false);
        }
    };

    const handleRemoveDiscipline = (disciplineToRemove) => {
        setSelectedDisciplines(prev => prev.filter(d => d.id !== disciplineToRemove.id));
        setSaveSuccess(false);
    };

    const handleSaveChanges = async () => {
        if (!ppcId || !ppcDetails) return;

        setIsSaving(true);
        setError('');
        setSaveSuccess(false);
        const disciplineIdsToSave = selectedDisciplines.map(d => d.id);

        try {
            await ppcEdit(ppcId, { discipline_ids: disciplineIdsToSave });
            setSaveSuccess(true);

        } catch (err) {
            console.error("Erro ao salvar alterações do PPC:", err);
            setError("Falha ao salvar alterações. Verifique os dados e tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        router.push("/courses");
    };

    if (loading) return <div className={styles.container}><div className={styles.loadingContainer}><FontAwesomeIcon icon={faSpinner} spin size="2x" /> Carregando Dados do PPC...</div></div>;
    if (error && !ppcDetails) return <Button label="Voltar" icon="pi pi-arrow-left" onClick={handleBack} className={styles.backButton} />
    if (!ppcDetails) return <div className={styles.container}><p>PPC não encontrado.</p><Button label="Voltar" icon="pi pi-arrow-left" onClick={handleBack} className={styles.backButton} /></div>;

    const disciplinesToAdd = availableDisciplines.filter(ad =>
        !selectedDisciplines.some(sd => sd.id === ad.id)
    );

    return (
        <div className={styles.container}>
            <Button label="Voltar" icon="pi pi-arrow-left" onClick={handleBack} className={styles.backButton} />

            <h1 className={styles.title}>{ppcDetails.name}</h1>
            <p className={styles.courseInfo}>Curso: {ppcDetails.course}</p>

            <div className={styles.disciplinesSection}>
                <h2 className={styles.sectionTitle}>Disciplinas Incluídas neste PPC</h2>
                <div className={styles.selectedItemsContainer}>
                    {selectedDisciplines.length === 0 ? (
                        <span className={styles.placeholder}>Nenhuma disciplina adicionada.</span>
                    ) : (
                        selectedDisciplines.map((disc) => (
                            <span key={disc.id} className={styles.selectedItem}>
                                {disc.name} ({disc.workload || 'N/A'})
                                <button onClick={() => handleRemoveDiscipline(disc)} className={styles.removeButton} title="Remover disciplina" disabled={isSaving}>
                                    <FontAwesomeIcon icon={faTrash} size="xs" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.addSection}>
                <h2 className={styles.sectionTitle}>Adicionar Disciplina ao PPC</h2>
                <select
                    onChange={(e) => { handleAddDiscipline(e.target.value); e.target.value = ""; }}
                    value=""
                    className={styles.select}
                    disabled={loading || isSaving}
                    aria-label="Adicionar disciplina ao PPC"
                >
                    <option value="" disabled>Selecione para adicionar...</option>
                    {disciplinesToAdd.length > 0 ? (
                        disciplinesToAdd.map((discipline) => (
                            <option key={discipline.id} value={discipline.id}>
                                {discipline.name}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Todas as disciplinas disponíveis já foram adicionadas.</option>
                    )}
                </select>
            </div>

            <div className={styles.feedbackAndSave}>
                {error && <p className={styles.errorTextSubmit}><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>}
                {saveSuccess && <p className={styles.successText}>Alterações salvas com sucesso!</p>}
                <Button style={{backgroundColor: '#28a745'}}onClick={handleSaveChanges} disabled={isSaving || loading}>
                    {isSaving ? <><FontAwesomeIcon icon={faSpinner} spin /> Salvando...</> : "Salvar alterações nas disciplinas"}
                </Button>
            </div>
        </div>
    );
};

export default EditPpcPage;