"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./requests.module.css";
import RequestService, { checkIfNoticeIsOpen } from "@/services/RequestService";
import { courseListReduced } from "@/services/CourseService";
import { noticeListAll } from "@/services/NoticeService";
import { useRequestFilters } from "@/hooks/useRequestFilters";
import { useAuth } from "@/context/AuthContext";
import { faPlus, faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { InputText } from "primereact/inputtext";
import Filter from "@/components/FilterField/filterField";
import { getStatusStepIndex, getSucceeded, getPending, getFailed, steps, filterStatus } from "@/app/requests/status";
import Toast from "@/utils/toast";

export default function Requests() {
  const { user } = useAuth();
  const router = useRouter();
  const [mergedRequests, setMergedRequests] = useState([]);
  const { filters, updateFilter } = useRequestFilters();
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPageOptions = [10, 20, 100, 0];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({});
  const closeToast = () => setToast(false);
  const {
    search,
    selectedStep,
    selectedStatus,
    selectedNotice,
    selectedCourse,
    selectedDiscipline,
    itemsPerPage
  } = filters;
  useEffect(() => {
    async function loadMeta() {
      setLoading(true);
      try {
        const [fetchedCourses, noticeRes] = await Promise.all([
          courseListReduced(),
          noticeListAll()
        ]);
        setCourses(fetchedCourses);
        const allNotices = noticeRes.results || [];
        setNotices(allNotices);
        if (allNotices.length > 0 && !selectedNotice) {
          const defaultNotice = { 
            id: allNotices[0].id, 
            title: allNotices[0].number 
          };
          updateFilter('selectedNotice', defaultNotice);
        }
        setMetaLoaded(true);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!metaLoaded) return;
    async function fetchData() {
      setLoading(true);
      try {
        const params = {};
        if (selectedNotice) params.notice = selectedNotice.id;
        if (selectedCourse) params.course = selectedCourse.id;
        const { data } = await RequestService.GetAllRequests({ params });
        const combined = [
          ...(data.recognition || []).map(i => ({ ...i, type: 'recognition' })),
          ...(data.knowledge || []).map(i => ({ ...i, type: 'knowledge' }))
        ];
        combined.sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
        setMergedRequests(combined);
        const uniq = Array.from(new Set(combined.map(i => i.discipline_name))).filter(Boolean);
        setDisciplines(uniq);
        setCurrentPage(1);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [metaLoaded, selectedNotice, selectedCourse]);

  const filtered = mergedRequests
    .filter(i => i.student_name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => !selectedStep || getStatusStepIndex(i.status_display) === selectedStep.id)
    .filter(i =>
      !selectedStatus ||
      (selectedStatus.title === 'Sucesso'
        ? getSucceeded().includes(i.status_display)
        : selectedStatus.title === 'Pendente'
          ? getPending().includes(i.status_display)
          : getFailed().includes(i.status_display)
      )
    )
    .filter(i => !selectedDiscipline || i.discipline_name === selectedDiscipline.title);

  const total = filtered.length;
  const perPage = itemsPerPage || total;
  const pages = Math.ceil(total / perPage);
  const displayed = filtered.slice(
    (currentPage - 1) * perPage,
    (currentPage - 1) * perPage + perPage
  );

  const handleFilterChange = (filterName, value) => {
    updateFilter(filterName, value);
    setCurrentPage(1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Erro: {error}</div>;

  const noticeOptions = notices.map(n => ({ id: n.id, title: n.number }));
  const courseOptions = courses.map(c => ({ id: c.id, title: c.name }));
  const stepOptions = steps.map(s => ({ id: s.index, title: s.label }));
  const statusOptions = filterStatus.map(s => ({ id: s, title: s }));
  const disciplineOptions = disciplines.map(d => ({ id: d, title: d }));
  const perPageList = perPageOptions.map(n => ({ id: n, title: n === 0 ? 'Todos' : n }));

  const handleDetailsClick = item => {
    const path = item.type === 'recognition'
      ? `/requests/details/recognition-forms/${item.id}/`
      : `/requests/details/knowledge-certifications/${item.id}/`;
    router.push(path);
  };

  const handleRequestFormRedirect = async () => {
    const isNoticeOpen = await checkIfNoticeIsOpen();
    if (isNoticeOpen) window.location.href = "/requests/requestForm";
    else {
      setToast(true);
      setToastMessage({ type: 'info', text: 'Não há edital aberto no momento, aguarde.' });
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.tableWrapper}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <InputText
            className={styles.nameFilter}
            value={search}
            onChange={e => handleFilterChange('search', e.target.value)}
            placeholder="Buscar por nome..."
          />
        </div>
        <div className={styles.filtersContainer}>
          <Filter
            optionList={stepOptions}
            label="Situação"
            value={selectedStep}
            onChange={(e, v) => handleFilterChange('selectedStep', v)}
          />

          <Filter
            optionList={statusOptions}
            label="Etapas"
            value={selectedStatus}
            onChange={(e, v) => handleFilterChange('selectedStatus', v)}
            width={180}
          />

          <Filter
            optionList={noticeOptions}
            label="Editais"
            value={selectedNotice}
            onChange={(e, v) => handleFilterChange('selectedNotice', v)}
            width={180}
          />

          <Filter
            optionList={courseOptions}
            label="Cursos"
            value={selectedCourse}
            onChange={(e, v) => handleFilterChange('selectedCourse', v)}
            width={390}
          />

          <Filter
            optionList={disciplineOptions}
            label="Disciplinas"
            value={selectedDiscipline}
            onChange={(e, v) => handleFilterChange('selectedDiscipline', v)}
          />

          <Filter
            optionList={perPageList}
            label="Itens"
            width={100}
            value={perPageList.find(o => o.id === itemsPerPage)}
            onChange={(e, v) => handleFilterChange('itemsPerPage', v.id)}
          />
        </div>
        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudante</th><th>Tipo</th><th>Disciplina</th><th>Criação</th><th>Responsável</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0
                ? <tr><td colSpan="7">Sem resultados</td></tr>
                : displayed.map(item => (
                  <tr key={item.id}>
                    <td>{item.student_name || '-'}</td>
                    <td>{item.type === 'knowledge' ? 'CC' : 'AE'}</td>
                    <td>{item.discipline_name || '-'}</td>
                    <td>
                      {new Date(item.create_date).toLocaleDateString('pt-BR')}{" "}
                      {new Date(item.create_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td>{Array.from(item.steps).pop()?.responsible?.name || '-'}</td>
                    <td>{item.status_display || '-'}</td>
                    <td>
                      <button className={styles.button} onClick={() => handleDetailsClick(item)}>
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.pagination}>
        <button className={styles.paginationButton} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className={styles.paginationInfo}>{currentPage} de {pages}</span>
        <button className={styles.paginationButton} disabled={currentPage === pages} onClick={() => setCurrentPage(p => p + 1)}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      {user.type === 'Estudante' && (
        <div className={styles.addButtonContainer}>
          <button onClick={handleRequestFormRedirect} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} size="2x" />
          </button>
        </div>
      )}
      {toast && <Toast type={toastMessage.type} close={closeToast}>{toastMessage.text}</Toast>}
    </div>
  );
}
