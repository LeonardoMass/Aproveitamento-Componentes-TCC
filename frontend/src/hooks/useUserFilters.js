import { useState, useCallback } from "react";

export const useUserFilters = (users, setFilteredUsers) => {
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedVerifieds, setSelectedVerifieds] = useState(null);

  const applyFilters = useCallback((currentUsers = users) => {
    let result = currentUsers;

    if (search) {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCourse) {
      result = result.filter((user) => user.course === selectedCourse.title);
    }

    if (selectedRole) {
      result = result.filter((user) => user.type === selectedRole.title);
    }
    if (selectedStatus) {
      result = result.filter((user) => user.is_active == selectedStatus.id);
    }
    if (selectedVerifieds) {
      result = result.filter((user) => user.is_verified == selectedVerifieds.id);
    }

    if (!(showActive && showInactive)) {
      if (showActive) {
        result = result.filter((user) => user.is_active);
      } else if (showInactive) {
        result = result.filter((user) => !user.is_active);
      }
    }

    setFilteredUsers(result);
  }, [search, showActive, showInactive, selectedCourse, selectedRole, selectedStatus, selectedVerifieds, setFilteredUsers]);

  return {
    search,
    setSearch,
    showActive,
    setShowActive,
    showInactive,
    setShowInactive,
    selectedStatus,
    setSelectedStatus,
    selectedVerifieds,
    setSelectedVerifieds,
    selectedCourse,
    setSelectedCourse,
    selectedRole,
    setSelectedRole,
    applyFilters,
  };
};