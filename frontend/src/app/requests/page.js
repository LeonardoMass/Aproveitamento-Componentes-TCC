"use client";
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./requests.module.css";
import RequestService, { checkIfNoticeIsOpen } from "@/services/RequestService";
import { courseListReduced } from "@/services/CourseService";
import { sendEmailReminder, sendReminderResume} from "@/services/EmailService";
import { noticeListAll } from "@/services/NoticeService";
import { useRequestFilters } from "@/hooks/useRequestFilters";
import { useAuth } from "@/context/AuthContext";
import { faPlus, faSearch, faChevronLeft, faChevronRight, faFileCsv, faEye, faEnvelope, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { InputText } from "primereact/inputtext";
import Filter from "@/components/FilterField/filterField";
import { getStatusStepIndex, steps, getFinished, pendingStatus } from "@/app/requests/status";
import { exportToCsv } from '@/utils/csvExporter';
import { handleApiResponse } from "@/libs/apiResponseHandler";

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedRequestForEmail, setSelectedRequestForEmail] = useState(null);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const {
    search,
    selectedStep,
    selectedStatus,
    selectedNotice,
    selectedCourse,
    selectedDiscipline,
    selectedOutcome,
    selectedType,
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
        const requests = [
          ...(data.recognition || []).map(i => ({ ...i, type: 'recognition' })),
          ...(data.knowledge || []).map(i => ({ ...i, type: 'knowledge' }))
        ];
        requests.sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
        setMergedRequests(requests);
        const uniq = Array.from(new Set(requests.map(i => i.discipline_name))).filter(Boolean);
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
    .filter(i => {
      if (user.type === 'Estudante') return true;
      return i.student_name.toLowerCase().includes(search.toLowerCase());
    })
    .filter(i => !selectedType || i.type === selectedType.id)
    .filter(i => {
      if (!selectedOutcome) return true;
      const { approval_status } = i;
      return approval_status === selectedOutcome.title;
    })
    .filter(i => !selectedStep || getStatusStepIndex(i.status_display) === selectedStep.id)
    .filter(i =>
      !selectedStatus ||
      (selectedStatus.title === 'Finalizado'
        ? getFinished().includes(i.status_display)
        : !getFinished().includes(i.status_display)
      )
    )
    .filter(i => !selectedDiscipline || i.discipline_name === selectedDiscipline.title);

  const total = (filtered.length == 0) ? 1 : filtered.length;
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

  const handleExportCSV = () => {
    const dataToExport = filtered.map(item => {
      const professorStep = Array.from(item.steps).findLast(
        step => step.status === 'A_PROF' || step.status === 'RJ_PROF'
      );
      const coordinatorStep = Array.from(item.steps).findLast(
        step => step.status === 'COORD'
      );

      return {
        'Estudante': item.student_name || '-',
        'Tipo': item.type === 'knowledge' ? 'Certificação de Conhecimento (CC)' : 'Aproveitamento de Estudos (AE)',
        'Disciplina': item.discipline_name || '-',
        'Data de Criação': new Date(item.create_date).toLocaleString('pt-BR'),
        'Resultado': item.approval_status || 'Pendente',
        'Coordenador': coordinatorStep?.responsible?.name || '-',
        'Professor': professorStep?.responsible?.name || '-',
        'Feedback do Professor': professorStep?.feedback || '-',
        'Estado': item.status_display || '-',
        'Edital': item.notice_number || '-',
      };
    });
    exportToCsv(dataToExport, `solicitacoes_filtradas_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const getRowClass = (status) => {
    if (status === 'Deferido') return styles.rowSuccess;
    if (status === 'Indeferido') return styles.rowFailure;
    return '';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Erro: {error}</div>;

  const typeOptions = [
    { id: 'knowledge', title: 'Certificação de Conhecimento' },
    { id: 'recognition', title: 'Aproveitamento de Estudos' }
  ];
  const noticeOptions = notices.map(n => ({ id: n.id, title: n.number }));
  const courseOptions = courses.map(c => ({ id: c.id, title: c.name }));
  const stepOptions = steps.map(s => ({ id: s.index, title: s.label }));
  const statusOptions = pendingStatus.map(s => ({ id: s, title: s }));
  const outcomeOptions = [
    { id: 'deferido', title: 'Deferido' },
    { id: 'indeferido', title: 'Indeferido' },
    { id: 'pendente', title: 'Pendente' },
    { id: 'cancelado', title: 'Cancelado' },
  ];
  const disciplineOptions = disciplines.map(d => ({ id: d, title: d }));
  const perPageList = perPageOptions.map(n => ({ id: n, title: n === 0 ? 'Todos' : n.toString() }));

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
      toast.info("Não há edital aberto no momento." )
    }
  };

  const shouldShowEmailButton = (request) => {
    if (!user || !request) return false;

    const { type: userType } = user;
    const { status_display } = request;

    if (userType === 'Ensino' &&
      (status_display === 'Em homologação do Coordenador' || status_display === 'Em análise do Coordenador')) {
      return true;
    }
    if (userType === 'Coordenador' && status_display === 'Em análise do Professor') {
      return true;
    }
    return false;
  };

  const handleOpenEmailModal = (request) => {
    setSelectedRequestForEmail(request);
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setSelectedRequestForEmail(null);
    setShowEmailModal(false);
  };

  const handleConfirmSendEmail = async ()  => {
    if (!selectedRequestForEmail) return;
     try {
        const response = await sendEmailReminder(selectedRequestForEmail);
        handleApiResponse(response); 
    } catch (error) {
        handleApiResponse(error);
    } finally {
        handleCloseEmailModal();
    }
  };
  
  const handleOpenBulkEmailModal = () => {
    setShowBulkEmailModal(true);
  };

  const handleCloseBulkEmailModal = () => {
    setShowBulkEmailModal(false);
  };
  
  const handleConfirmSendBulkEmail = async () => {
    toast.info("Função de envio em massa será implementada aqui.");
    sendReminderResume();
    handleCloseBulkEmailModal();
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.tableWrapper}>
        <div className={styles.filtersContainer}>
          {user.type !== 'Estudante' && (
            <>
              <div className={styles.searchWrapper}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <InputText
                  className={styles.nameFilter}
                  value={search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  placeholder="Buscar por nome..."
                />
              </div>
              <Filter
                optionList={courseOptions}
                label="Cursos"
                value={selectedCourse || null}
                onChange={(e, v) => handleFilterChange('selectedCourse', v)}
                width={300}
              />
              <Filter
                optionList={statusOptions}
                label="Situação"
                value={selectedStatus || null}
                onChange={(e, v) => handleFilterChange('selectedStatus', v)}
                width={160}
              />
            </>
          )}

          <Filter
            optionList={typeOptions}
            label="Tipo"
            value={selectedType || null}
            onChange={(e, v) => handleFilterChange('selectedType', v)}
            width={250}
          />
          <Filter
            optionList={stepOptions}
            label="Etapas"
            value={selectedStep || null}
            onChange={(e, v) => handleFilterChange('selectedStep', v)}
          />
          <Filter
            optionList={outcomeOptions}
            label="Resultado"
            value={selectedOutcome || null}
            onChange={(e, v) => handleFilterChange('selectedOutcome', v)}
            width={170}
          />
          <Filter
            optionList={noticeOptions}
            label="Editais"
            value={selectedNotice || null}
            onChange={(e, v) => handleFilterChange('selectedNotice', v)}
            width={160}
          />
          <Filter
            optionList={disciplineOptions}
            label="Disciplinas"
            value={selectedDiscipline || null}
            onChange={(e, v) => handleFilterChange('selectedDiscipline', v)}
          />
          <Filter
            optionList={perPageList}
            label="Itens"
            width={100}
            value={perPageList.find(o => o.id === itemsPerPage) || null}
            onChange={(e, v) => handleFilterChange('itemsPerPage', v ? v.id : 10)}
          />
          <div className={styles.actionButtonsContainer}>
            {user.type !== 'Estudante' && (
              <button className={styles.exportButton} onClick={handleExportCSV} title="Exportar dados filtrados para CSV">
                <FontAwesomeIcon icon={faFileCsv} /> Exportar CSV
              </button>
            )}

            {user.type === 'Ensino' && (
              <button 
                className={styles.exportButton}
                onClick={handleOpenBulkEmailModal} 
                title="Notificar todos os responsáveis com solicitações pendentes"
              >
                <FontAwesomeIcon icon={faBullhorn} /> Notificar Pendentes
              </button>
            )}
          </div>
        </div>
        <div className={styles.tableSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudante</th>
                <th>Tipo</th>
                <th>Disciplina</th>
                <th>Criação</th>
                <th>Responsável</th>
                <th>Estado</th>
                <th>Resultado</th>
                <th>Edital</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0
                ? <tr><td colSpan="9">Sem resultados</td></tr>
                : displayed.map(item => (
                  <tr key={item.id} className={getRowClass(item.approval_status)}>
                    <td>{item.student_name || '-'}</td>
                    <td>{item.type === 'knowledge' ? 'CC' : 'AE'}</td>
                    <td>{item.discipline_name || '-'}</td>
                    <td>
                      {new Date(item.create_date).toLocaleDateString('pt-BR')}{" "}
                      {new Date(item.create_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td>{Array.from(item.steps).pop()?.responsible?.name || '-'}</td>
                    <td>{item.status_display || '-'}</td>
                    <td>{item.approval_status}</td>
                    <td>{item.notice_number || '-'}</td>
                    <td>
                      {shouldShowEmailButton(item) && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleOpenEmailModal(item)}
                          title="Enviar notificação por e-mail"
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                        </button>
                      )}
                      <button className={styles.iconButton} onClick={() => handleDetailsClick(item)} title="Ver detalhes">
                        <FontAwesomeIcon icon={faEye} />
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
      {showEmailModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirmar Envio de Lembrete</h3>
            <p>Enviar um e-mail notificando {Array.from(selectedRequestForEmail.steps).pop()?.responsible.name} desta solicitação?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalDeclineButton}
                onClick={handleCloseEmailModal}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleConfirmSendEmail}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkEmailModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirmar Envio de Lembretes em Massa</h3>
            <p>
              Esta ação enviará um e-mail com um resumo das solicitações pendentes para todos os responsáveis nas etapas "Análise do Coordenador", "Análise do Professor" e "Homologação do Coordenador". Deseja continuar?
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalDeclineButton}
                onClick={handleCloseBulkEmailModal}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleConfirmSendBulkEmail}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}