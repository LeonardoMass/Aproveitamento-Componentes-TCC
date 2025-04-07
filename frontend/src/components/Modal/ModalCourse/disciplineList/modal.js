import React, { useEffect, useState } from "react";
import styles from "./modalDisciplineList.module.css";
import { ppcList } from '@/services/PpcService';
import { getDisciplineDetailsBatch } from '@/services/DisciplineService';

const ModalPpcDisciplineList = ({ course, onClose }) => {
  const [ppcs, setPpcs] = useState([]);
  const [selectedPpc, setSelectedPpc] = useState(null);
  const [displayDisciplines, setDisplayDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPpcsAndDisciplines = async () => {
      if (!course?.id) {
          setLoading(false);
          return;
      }

      setLoading(true);
      setError('');
      try {
        const fetchedPpcs = await ppcList({ course_id: course.id });
        setPpcs(fetchedPpcs);

        if (fetchedPpcs.length > 0) {
          const firstPpc = fetchedPpcs[0];
          setSelectedPpc(firstPpc);
          if (firstPpc.disciplines && firstPpc.disciplines.length > 0) {
            const disciplineDetails = await getDisciplineDetailsBatch(firstPpc.disciplines);
            setDisplayDisciplines(disciplineDetails);
          } else {
            setDisplayDisciplines([]);
          }
        } else {
          setSelectedPpc(null);
          setDisplayDisciplines([]);
        }
      } catch (err) {
        console.error("Erro ao buscar PPCs ou disciplinas:", err);
        setError("Falha ao carregar dados. Tente novamente.");
        setDisplayDisciplines([]);
      } finally {
         setLoading(false);
      }
    };

    fetchPpcsAndDisciplines();
  }, [course]);

  const handlePpcChange = async (event) => {
    const ppcId = event.target.value;
    const newSelectedPpc = ppcs.find(p => p.id === ppcId);
    if (newSelectedPpc) {
      setSelectedPpc(newSelectedPpc);
      setLoading(true);
      setError('');
      try {
          if (newSelectedPpc.disciplines && newSelectedPpc.disciplines.length > 0) {
              const disciplineDetails = await getDisciplineDetailsBatch(newSelectedPpc.disciplines);
              setDisplayDisciplines(disciplineDetails);
          } else {
              setDisplayDisciplines([]);
          }
      } catch (err) {
          console.error("Erro ao buscar disciplinas para o PPC selecionado:", err);
          setError("Falha ao carregar disciplinas do PPC selecionado.");
          setDisplayDisciplines([]);
      } finally {
          setLoading(false);
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Disciplinas do Curso: {course.name}</h2>

        {error && <p className={styles.errorText}>{error}</p>}
        {loading && <p className={styles.loadingText}>Carregando...</p>}

        {!loading && !error && ppcs.length === 0 && (
          <p className={styles.infoText}>Não há Projetos Pedagógicos (PPCs) cadastrados para este curso.</p>
        )}

        {!loading && !error && ppcs.length > 0 && (
          <>
            {ppcs.length >= 1 && (
              <div className={styles.ppcSelector}>
                 <label htmlFor="ppcSelect">Visualizando PPC: </label>
                 <select id="ppcSelect" value={selectedPpc?.id || ''} onChange={handlePpcChange}>
                   {ppcs.map(ppc => (
                     <option key={ppc.id} value={ppc.id}>{ppc.name || `PPC ${ppc.id.substring(0, 8)}`}</option>
                   ))}
                 </select>
              </div>
            )}

            {selectedPpc && displayDisciplines.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Carga Horária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayDisciplines.map((disc) => (
                      <tr key={disc.id}>
                        <td>{disc.name ?? "N/A"}</td>
                        <td>{disc.workload ?? "N/A"}</td>
                        {/*<td>{disc.professors ?? "N/A"}</td>*/}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
               <p className={styles.infoText}>{selectedPpc ? "Este PPC não possui disciplinas cadastradas." : ""}</p>
            )}
          </>
        )}

        <button className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalPpcDisciplineList;