"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleUserLogout, useAuth } from "@/context/AuthContext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { noticeListAll } from "@/services/NoticeService";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import styles from "./navBar.module.css";

const NavBar = () => {
  const { user } = useAuth();
  const isUserAuth = !!user;
  const [activeIndex, setActiveIndex] = useState(0);
  const pathname = usePathname();
  const [notice, setNotice] = useState(null);
  const menuLeft = useRef(null);

  useEffect(() => {
    const routeToIndexMap = {
      "/requests": 0,
      "/notice": 1,
      "/courses": 2,
      "/discipline": 3,
      "/requests/requestForm": 4,
      "/usersList": 5,
    };
    if (routeToIndexMap.hasOwnProperty(pathname)) {
      setActiveIndex(routeToIndexMap[pathname]);
    } else {
      setActiveIndex(0);
    }
  }, [pathname]);

  useEffect(() => {
    if (isUserAuth && user?.type === "Estudante") {
      getCurrentNotice();
    }
  }, [isUserAuth, user]);

  const getCurrentNotice = async () => {
    try {
      const value = await noticeListAll();
      if (isNoticeOpen(value.results[0])) setNotice(value.results[0]);

    } catch (error) {
      console.error("Error fetching notice:", error);
    }
  };
  const isNoticeOpen = (notice) => {
    if (!notice) return false;
    const now = new Date();
    const start = new Date(notice.documentation_submission_start);
    const end = new Date(notice.documentation_submission_end);
    return now >= start && now <= end;
  };

  const items = [
    {
      label: "Opções",
      items: [
        {
          label: "Alterar dados",
          icon: "pi pi-cog",
          command: () => (window.location.href = `/register`),
        },
        {
          label: "Sair",
          icon: "pi pi-sign-out",
          command: () => handleUserLogout(),
        },
      ],
    },
  ];

  const handleDropdown = (event) => {
    if (menuLeft.current) {
      menuLeft.current.toggle(event);
    }
  };

  const menuItems = [
    {
      label: "Solicitações",
      icon: "pi pi-envelope",
      command: () => (window.location.href = `/requests`),
    },
    {
      label: "Editais",
      icon: "pi pi-file",
      command: () => (window.location.href = `/notice`),
    },
    ...(user?.type === "Estudante" && notice
      ? [
        {
          label: "Realizar Solicitação",
          icon: "pi pi-check-circle",
          command: () => (window.location.href = `/requests/requestForm`),
        },
      ]
      : []),
    ...(user?.type !== "Estudante"
      ? [
        {
          label: "Cursos",
          icon: "pi pi-book",
          command: () => (window.location.href = `/courses`),
        },
        {
          label: "Disciplinas",
          icon: "pi pi-list",
          command: () => (window.location.href = `/discipline`),
        },
        {
          label: "Usuários",
          icon: "pi pi-users",
          command: () => (window.location.href = `/usersList`),
        },
      ]
      : []),
  ];

  const menuAuth = () => (
    <>
      <div className="px-3 flex flex-col">
        <span>
          Bem vindo, <b>{user?.name || "Usuário"}</b>
        </span>
        <strong className="text-center">{user?.type || "Tipo de Usuário"}</strong>
      </div>
      <div className="px-2 relative">
        <Button
          icon="pi pi-fw pi-bars"
          className="p-button-text p-button-sm text-white"
          onClick={handleDropdown}
          aria-controls="popup_menu_left"
          aria-haspopup
        />
        <Menu model={items} popup ref={menuLeft} id="popup_menu_left" />
      </div>
    </>
  );

  const menuNotAuth = () => (
    <>
      <div className="px-3">Você ainda não se identificou</div>
      <div className="px-2">
        <Link
          href="/auth"
          className="flex p-2 font-bold border-2 border-solid rounded anchor-link align-center border-black/30"
        >
          <span>Acessar</span>
          <span className="p-icon pi pi-fw pi-sign-in ms-2"></span>
        </Link>
      </div>
    </>
  );

  const [theme, setTheme] = useState("light");

  const navOptions = () => (
    <>
      <div className={styles.navBarWrapper}>
        <div className={styles.customTabMenu}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`${styles.menuItem} ${activeIndex === index ? styles.active : ""
                }`}
              onClick={() => {
                setActiveIndex(index);
                item.command();
              }}
            >
              <i className={`pi ${item.icon}`} style={{ marginRight: "0.5rem" }}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.classList.remove(theme);
    document.body.classList.add(newTheme);
  };

  useEffect(() => {
    document.body.classList.add(theme);
  }, []);

  return (
    <div style={{ backgroundColor: "#2f9e41" }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-between max-w-screen-xlg px-20 py-8 mx-auto">
        <Link href={isUserAuth ? "/requests" : "/auth"} className="pl-12">
          <Image
            src="/ifrs.png"
            alt="IFRS Logo"
            className="dark:invert"
            height={40}
            width={151}
          />
        </Link>
        {isUserAuth ? navOptions() : ""}
        <div className="flex items-center justify-around text-white">
          {isUserAuth ? menuAuth() : menuNotAuth()}
        </div>
      </div>
    </div>
  );
};

export default NavBar;