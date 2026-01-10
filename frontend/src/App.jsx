import { useState, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import DocumentManager from "./components/DocumentManager";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import StatusBar from "./components/StatusBar";

export default function App() {
  const [useRag, setUseRag] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      return JSON.parse(savedDarkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat"); // chat, documents, settings
  const [apiStatus, setApiStatus] = useState("checking");

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Check API health on mount
  async function checkApiHealth() {
    try {
      const res = await fetch("http://localhost:8000/health");
      if (res.ok) {
        setApiStatus("connected");
      } else {
        setApiStatus("error");
      }
    } catch {
      setApiStatus("disconnected");
    }
  }

  useEffect(() => {
    let isMounted = true;

    const initializeHealth = async () => {
      try {
        const res = await fetch("http://localhost:8000/health");
        if (isMounted) {
          setApiStatus(res.ok ? "connected" : "error");
        }
      } catch {
        if (isMounted) {
          setApiStatus("disconnected");
        }
      }
    };

    initializeHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <div className="main-container">
        {sidebarOpen && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            useRag={useRag}
            setUseRag={setUseRag}
          />
        )}

        <div className="content-area">
          {activeTab === "chat" && <ChatBox useRag={useRag} darkMode={darkMode} />}
          {activeTab === "documents" && <DocumentManager darkMode={darkMode} />}
          {activeTab === "settings" && (
            <Settings
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              useRag={useRag}
              setUseRag={setUseRag}
            />
          )}
        </div>
      </div>

      <StatusBar apiStatus={apiStatus} darkMode={darkMode} />
    </div>
  );
}