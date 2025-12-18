import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Feed from "./components/Feed.jsx";
import AuthModal from "./pages/AuthModal.jsx";
import PostPage from "./pages/Post.jsx";
import ProfilePage from "./pages/Profile.jsx";
import CreateSurveyPage from "./pages/CreateSurvey.jsx";

export default function App() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState(null);

  return (
    <div className="app">
      <Header query={query} onQueryChange={setQuery} />
      <main className="content">
        <Sidebar selectedTopic={topic} onSelectTopic={setTopic} />
        <Routes>
          <Route path="/" element={<Feed query={query} topic={topic} />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<CreateSurveyPage />} />
          <Route path="/login" element={<AuthModal />} />
        </Routes>
      </main>
    </div>
  );
}
