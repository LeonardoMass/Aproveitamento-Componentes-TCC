"use client";
import { toast } from 'react-toastify';
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./usersList.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faEye, faSearch, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Filter from "@/components/FilterField/filterField";
import { useUserFilters } from "@/hooks/useUserFilters";
import AuthService from "@/services/AuthService";
import FormProfile from "@/components/Forms/Profile/ProfileForm";
import { InputText } from "primereact/inputtext";
import { useAuth } from "@/context/AuthContext";
import { handleApiResponse } from "@/libs/apiResponseHandler";

const UsersList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    search,
    setSearch,
    showActive,
    setShowActive,
    showInactive,
    setShowInactive,
    selectedStatus,
    setSelectedStatus,
    selectedCourse,
    setSelectedCourse,
    selectedRole,
    setSelectedRole,
    applyFilters,
  } = useUserFilters(users, setFilteredUsers);

  const handleFilterKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  }, [applyFilters]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await AuthService.UserList();
        setUsers(data);
        applyFilters(data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [applyFilters]);

  const handleEdit = (user) => setEditingUser(user);

  const refreshUserList = useCallback(async () => {
    try {
      const data = await AuthService.UserList();
      setUsers(data);
      applyFilters(data);
    } catch (err) {
      setError(err.message || "Erro ao atualizar lista de usuários.");
    }
  }, [applyFilters]);

  const handleToast = (type, text) => {
    if (type === 'sucess') toast.success(text);
    if (type === 'error') toast.error(text);
  };

  const updateActivity = useCallback(async (userId) => {
    try {
      let response = await AuthService.UpdateActivity(userId);
      handleApiResponse(response);
      await refreshUserList();
    } catch (err) {
      handleToast('error', 'Erro ao atualizar status.');
    }
  }, [refreshUserList]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const coursesArray = [
    ...new Set(users.map((user) => user.course).filter(Boolean)),
  ].map((course) => ({
    id: course,
    title: course,
  }));

  const rolesArray = [
    ...new Set(users.map((user) => user.type).filter(Boolean)),
  ].map((role) => ({
    id: role,
    title: role,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <InputText
              className={styles.nameFilter}
              type="text"
              value={search}
              placeholder="Buscar nome..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleFilterKeyDown}
            />
          </div>
          <div className={styles.filtersContainer}>
            <Filter
              optionList={coursesArray}
              label="Cursos"
              onChange={(event, value) => setSelectedCourse(value)}
              onKeyDown={handleFilterKeyDown}
            />
            <Filter
              optionList={rolesArray}
              label="Tipo"
              onChange={(event, value) => setSelectedRole(value)}
              onKeyDown={handleFilterKeyDown}
            />
            <Filter
              optionList={[
                { id: true, title: 'Ativo' },
                { id: false, title: 'Inativo' },
              ]}
              label="Estado"
              onChange={(event, value) => setSelectedStatus(value)}
              onKeyDown={handleFilterKeyDown}
            />
          </div>
        </div>
        <div className={styles.scrollableTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Matricula/Siape</th>
                <th>Email</th>
                <th>Curso</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name ?? "N/A"}</td>
                  <td>{u.type ?? "N/A"}</td>
                  <td>{u.matricula ?? u.siape ?? "N/A"}</td>
                  <td>{u.email ?? "N/A"}</td>
                  <td>{u.course ?? "N/A"}</td>
                  <td>{u.is_active ? "Ativo" : "Inativo"}</td>
                  <td>
                    {user?.type === 'Ensino' && (
                      <>
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          style={{ marginRight: "10px", cursor: "pointer" }}
                          onClick={() => handleEdit(u)}
                        />
                        <FontAwesomeIcon
                          icon={u.is_active ? faTrash : faEye}
                          style={{ cursor: "pointer", color: u.is_active ? "#dc3545" : "#6c757d" }}
                          onClick={() => updateActivity(u.id)}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingUser && (
        <>
          <div className={styles.overlay}></div>
          <div className={styles.modal}>
            <h2>Editar Usuário</h2>
            <FormProfile
              user={editingUser}
              onSave={async (type, text) => {
                await refreshUserList();
                setEditingUser(null);
                handleToast(type, text);
              }}
              onCancel={() => setEditingUser(null)}
              admEditing={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UsersList;