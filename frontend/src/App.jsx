import { useState } from "react";
import ChatBox from "./components/ChatBox";
import DocumentManager from "./components/DocumentManager";
import Header from "./components/Header";
// import FileUpload from "./components/FileUpload";

export default function App() {
  const [useRag, setUseRag] = useState(true);

  return (
    <div className="app">
      <Header />

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={useRag}
            onChange={() => setUseRag(!useRag)}
          />
          Use RAG (documents)
        </label>
      </div>

      <div className="layout">
        <DocumentManager />
        {/* <FileUpload /> */}
        <ChatBox useRag={useRag} />
      </div>
    </div>
  );
}
