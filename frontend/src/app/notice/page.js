"use client";
import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faEdit } from "@fortawesome/free-solid-svg-icons";
import styles from "./notice.module.css";
import ModalNotice from "@/components/Modal/ModalNotice/page";
import { noticeList, noticeListAll } from "@/services/NoticeService";
import { formatDate } from "@/hooks/formatDate";
import Toast from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAuth } from "@/context/AuthContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { InputText } from "primereact/inputtext";

const ITEMS_PER_PAGE = 10;

const Notice = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [lastNotice, setLastNotice] = useState(null);
  const [allNotices, setAllNotices] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({});
  const [expand, setExpand] = useState(false);

  const fetchNotices = useCallback(async (page, search) => {
    try {
      const data = await noticeList({ page, pageSize: ITEMS_PER_PAGE, search });
      setNotices(data.results);
      setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
    } catch {
      setToastVisible(true);
      setToastMessage({ type: "error", text: "Falha ao carregar editais." });
    }
  }, []);

  useEffect(() => {
    fetchNotices(currentPage, filter);
  }, [currentPage, filter, fetchNotices]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await noticeListAll();
        setAllNotices(data.results);
        setLastNotice(data.results[0] || null);
      } catch {
        setToastVisible(true);
        setToastMessage({ type: "error", text: "Não foi possível buscar os editais." });
      }
    };
    loadAll();
  }, []);

  const isNoticeOpen = (notice) => {
    if (!notice) return false;
    const now = new Date();
    const start = new Date(notice.documentation_submission_start);
    const end = new Date(notice.documentation_submission_end);
    return now >= start && now <= end;
  };

  const isNoticeActive = (notice) => {
    if (!notice) return false;
    const now = new Date();
    const pub = new Date(notice.publication_date);
    const res = new Date(notice.result_publication);
    return now >= pub && now <= res;
  };

  const isOpeningFuture = (notice) => {
    if (!notice) return false;
    const now = new Date();
    const start = new Date(notice.documentation_submission_start);
    return now < start;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (e, notice) => {
    e.stopPropagation();
    setEditData(notice);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditData(null);
    setModalOpen(false);
  };

  const handleCloseToast = () => {
    setToastVisible(false);
  };

  const handleModalResponse = (responseType) => {
    const messages = {
      edit: "Edital atualizado com sucesso!",
      create: "Edital criado com sucesso!",
      error: "Erro ao enviar os dados. Tente novamente.",
    };
    setToastVisible(true);
    setToastMessage({
      type: responseType === "error" ? "error" : "success",
      text: messages[responseType],
    });
    if (responseType === "edit" || responseType === "create") {
      fetchNotices(currentPage, filter);
    }
  };

  if (user.type === "Ensino") {
    return (
      <div className={styles.contentWrapper}>
        <div className={styles.headerContainer}>
          <h1 className={styles.pageTitle}>Editais</h1>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <InputText
                className={styles.nameFilter}
                type="text"
                value={filter}
                placeholder="Filtrar por número..."
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <FontAwesomeIcon icon={faSearch} size="lg" className={styles.searchIcon} />
            </div>
          </div>
        </div>
        <div className={styles.scrollableTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Edital</th>
                <th>Data da Publicação</th>
                <th>Abertura de solicitações</th>
                <th>Análise das solicitações</th>
                <th>Resultado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <tr key={notice.id}>
                    <td>
                      <button
                        className={styles.linkButton}
                        onClick={() => window.open(notice.link, "_blank")}
                      >
                        {notice.number ?? "N/A"}
                      </button>
                    </td>
                    <td>{formatDate(notice.publication_date) ?? "N/A"}</td>
                    <td>
                      {`${formatDate(notice.documentation_submission_start)} até ${formatDate(
                        notice.documentation_submission_end
                      )}`}
                    </td>
                    <td>
                      {`${formatDate(notice.proposal_analysis_start)} até ${formatDate(
                        notice.proposal_analysis_end
                      )}`}
                    </td>
                    <td>{formatDate(notice.result_publication) ?? "N/A"}</td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={(e) => handleOpenEdit(e, notice)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.noResults}>
                    {filter ? "Nenhum resultado." : "Nenhum edital encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.addButtonContainer}>
          <button
            onClick={handleOpenCreate}
            className={!isNoticeActive(lastNotice) ? styles.addButton : styles.addDisableButton}
            disabled={isNoticeActive(lastNotice)}
          >
            <FontAwesomeIcon icon={faPlus} size="lg" />
            <span>Novo Edital</span>
          </button>
        </div>
        <div className={styles.paginationContainer}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${styles.pageButton} ${currentPage === 1 ? styles.pageButtonDisabled : ""
              }`}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.pageButtonDisabled : ""
              }`}
          >
            Próxima
          </button>
        </div>
        {modalOpen && <ModalNotice onClose={handleCloseModal} editData={editData} response={handleModalResponse} />}
        {toastVisible && (
          <Toast type={toastMessage.type} close={handleCloseToast}>
            {toastMessage.text}
          </Toast>
        )}
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.lastNoticeSection}>
        {lastNotice ? (
          <div
            className={styles.lastNoticeCard}
            onClick={() => window.open(lastNotice.link, "_blank")}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                Último Edital: {lastNotice.number}
              </span>
              <span
                className={`${styles.statusBadge} ${isOpeningFuture(lastNotice)
                  ? styles.upcoming
                  : isNoticeOpen(lastNotice)
                    ? styles.open
                    : styles.closed
                  }`}
              >
                {isOpeningFuture(lastNotice)
                  ? `Abertura de solicitações estará disponível em ${formatDate(
                    lastNotice.documentation_submission_start
                  )}`
                  : isNoticeOpen(lastNotice)
                    ? "Aberto para solicitações"
                    : "Fechado para solicitações"}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p>Publicado em {formatDate(lastNotice.publication_date)}</p>
              <p className={styles.highlightDate}>
                <strong>Abertura de solicitações:</strong>{" "}
                {formatDate(lastNotice.documentation_submission_start)} –{" "}
                {formatDate(lastNotice.documentation_submission_end)}
              </p>
              <p>
                <strong>Análise das solicitações:</strong>{" "}
                {formatDate(lastNotice.proposal_analysis_start)} –{" "}
                {formatDate(lastNotice.proposal_analysis_end)}
              </p>
              <p>
                <strong>Resultado:</strong>{" "}
                {formatDate(lastNotice.result_publication)}
              </p>
              <div className={styles.cardButtons}>
                <button className={styles.viewButton}>Ver edital completo</button>
                <button
                  className={`${styles.requestButton} ${!(isNoticeOpen(lastNotice) && user.type === "Estudante") ? styles.disabledButton : ""
                    }`}
                  disabled={!(isNoticeOpen(lastNotice) && user.type === "Estudante")}
                  onClick={() => (window.location.href = `/requests/requestForm`)}
                >
                  Realizar solicitação
                </button>
              </div>
            </div>
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </div>
      <div className={styles.collapseHeader} onClick={() => setExpand(!expand)}>
        <h2>Editais Anteriores</h2>
        {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      {expand && (
        <div className={styles.collapseContent}>
          {allNotices
            ?.filter((n) => n.id !== lastNotice?.id)
            .map((notice) => (
              <div
                key={notice.id}
                className={styles.noticeCard}
                onClick={() => window.open(notice.link, "_blank")}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{notice.number}</span>
                  <span
                    className={`${styles.statusBadge} ${isNoticeOpen(notice) ? styles.open : styles.closed
                      }`}
                  >
                    {isNoticeOpen(notice) ? "Aberto" : "Fechado"}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p>Publicado em {formatDate(notice.publication_date)}</p>
                  <p className={styles.highlightDate}>
                    <strong>Abertura de solicitações:</strong>{" "}
                    {formatDate(notice.documentation_submission_start)} –{" "}
                    {formatDate(notice.documentation_submission_end)}
                  </p>
                  <p>
                    <strong>Análise das solicitações:</strong>{" "}
                    {formatDate(notice.proposal_analysis_start)} –{" "}
                    {formatDate(notice.proposal_analysis_end)}
                  </p>
                  <p>
                    <strong>Resultado:</strong>{" "}
                    {formatDate(notice.result_publication)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Notice;