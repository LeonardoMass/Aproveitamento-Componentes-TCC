'use client'

import React from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Page() {

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {

    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      window.location.href = '/profile';
    }
    setLoading(false);
  }, []);

  if (loading) return <div><div><FontAwesomeIcon icon={faSpinner} spin size="2x" /> Carregando...</div></div>;

}
