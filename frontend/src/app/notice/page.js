"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./notice.module.css";
import ModalNotice from "@/components/Modal/ModalNotice/page";
import { noticeList, noticeListAll } from "@/services/NoticeService";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import { Button } from "@/components/Button/button";
import Toast from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAuth } from "@/context/AuthContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { InputText } from "primereact/inputtext";

const ITEMS_PER_PAGE = 10; // Quantidade de itens por página

const Notice = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [lastNotice, setLastNotice] = useState(null);
  const [allNotices, setAllNotices] = useState(null);

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({});
  const [expand, setExpand] = useState(false);

  // Fetch notices com paginação
  const fetchNotices = async (page = 1) => {
    try {
      const data = await noticeList({ page, pageSize: ITEMS_PER_PAGE });
      setNotices(data.results);
      setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
    } catch (err) {
      console.error("Erro ao buscar notices:", err);
    }
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await noticeListAll();
        setAllNotices(data.results);
        setLastNotice(
          data.results
            .sort(
              (a, b) =>
                new Date(b.publication_date) - new Date(a.publication_date)
            )
            .slice(0, 1)[0]
        );
      } catch (err) {
        setToast(true);
        setToastMessage({
          type: "error",
          text: "Não fui possivel buscar os editais",
        });
      }
    };
    fetchNotices();
  }, []);

  const isNoticeOpen = (notice) => {
    if (!notice) return false;
    const now = new Date();
    const startDate = new Date(notice.documentation_submission_start);
    const endDate = new Date(notice.documentation_submission_end);
    return now >= startDate && now <= endDate;
  };
  const isOtherNoticeOpen = (notice) => {
    if (!notice) return false;

    const now = new Date();
    const startDate = new Date(notice.documentation_submission_start);
    const endDate = new Date(notice.documentation_submission_end);

    return now >= startDate && now <= endDate;
  };

  // Fetch inicial
  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage]);

  // Atualiza notices após fechar o modal
  useEffect(() => {
    if (!modal) {
      fetchNotices(currentPage);
    }
  }, [modal]);

  // Handle filtro
  const applyFilters = () => {
    if (filter) {
      return notices.filter(
        (notice) =>
          notice.number?.toLowerCase().includes(filter.toLowerCase()) ||
          notice.publication_date.includes(filter) ||
          notice.link?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return notices;
  };

  const filteredNotices = applyFilters();

  // Controle de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Modal e toast
  const openModalForEdit = (notice) => {
    setEditData(notice);
    setModal(true);
  };

  const closeModal = () => {
    setEditData(null);
    setModal(false);
  };

  const clearFilters = () => {
    setFilter("");
  };

  const closeToast = () => {
    setToast(false);
  };

  const response = (responseModal) => {
    const messages = {
      edit: "Edital atualizado com sucesso!",
      create: "Edital criado com sucesso!",
      error: "Erro ao enviar os dados. Tente novamente.",
    };

    setToast(true);
    setToastMessage({
      type: responseModal === "error" ? "error" : "success",
      text: messages[responseModal],
    });
  };

  return user.type !== "Estudante" ? (
    <div className={styles.contentWrapper}>
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>Editais</h1>
      </div>
      <div className={styles.filters}>
        <div className={styles.filterInputWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <InputText
            type="text"
            placeholder="Filtrar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <Button onClick={clearFilters} className={styles.clearButton}>
          Limpar
        </Button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Edital</th>
              <th>Ano de Publicação</th>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotices.map((notice) => (
              <tr key={notice.id} onClick={() => openModalForEdit(notice)}>
                <td>{notice.number ?? "N/A"}</td>
                <td>{useDateFormatter(notice.publication_date) ?? "N/A"}</td>
                <td>
                  {useDateFormatter(notice.documentation_submission_start) ??
                    "N/A"}
                </td>
                <td>
                  {useDateFormatter(notice.documentation_submission_end) ??
                    "N/A"}
                </td>
                <td>
                  <a href={notice.link}>{notice.link ?? "N/A"}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setModal(true)} className={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} size="2x" />
      </button>
      <div className={styles.paginationContainer}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            backgroundColor: `${currentPage === 1 ? "gray" : "#5299f7"}`,
            cursor: `${currentPage === 1 ? "not-allowed" : "pointer"}`,
          }}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            backgroundColor: `${
              currentPage === totalPages ? "gray" : "#5299f7"
            }`,
            cursor: `${currentPage === totalPages ? "not-allowed" : "pointer"}`,
          }}
        >
          Próxima
        </button>
      </div>
      {modal && (
        <ModalNotice
          onClose={closeModal}
          editData={editData}
          response={response}
        />
      )}
      {toast && (
        <Toast type={toastMessage.type} close={closeToast}>
          {toastMessage.text}
        </Toast>
      )}
    </div>
  ) : (
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
              <span className={`${styles.statusBadge} ${isNoticeOpen(lastNotice) ? styles.open : styles.closed}`}>
                {isNoticeOpen(lastNotice) ? "Aberto" : "Fechado"}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p>Publicado em {useDateFormatter(lastNotice.publication_date)}</p>
              <p>
                Prazo: {useDateFormatter(lastNotice.documentation_submission_start)} –{" "}
                {useDateFormatter(lastNotice.documentation_submission_end)}
              </p>
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
            .filter(n => n.id !== lastNotice?.id)
            .map(notice => (
              <div
                key={notice.id}
                className={styles.noticeCard}
                onClick={() => window.open(notice.link, "_blank")}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{notice.number}</span>
                  <span className={`${styles.statusBadge} ${isNoticeOpen(notice) ? styles.open : styles.closed}`}>
                    {isNoticeOpen(notice) ? "Aberto" : "Fechado"}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p>Publicado em {useDateFormatter(notice.publication_date)}</p>
                  <p>
                    Prazo: {useDateFormatter(notice.documentation_submission_start)} –{" "}
                    {useDateFormatter(notice.documentation_submission_end)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

    </div>
  )
};

export default Notice;