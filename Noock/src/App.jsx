import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Connections from "./pages/Connections";
import Messages from "./pages/Messages";
import MyProfile from "./pages/MyProfile";
import TestConnection from "./pages/TestConnection";
import BlindChatView from "./pages/BlindChatView";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BlindChatInvite from "./components/blind/BlindChatInvite";
import ReportBugButton from "./components/ui/ReportBugButton";
import PublicProfile from "./pages/PublicProfile";

export default function App() {
  return (
    <>
      <BlindChatInvite />
      <ReportBugButton />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<TestConnection />} />

        {/* Onboarding (requiere sesión pero NO requiere onboarding completo) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protegidas */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blind/:chatId"
          element={
            <ProtectedRoute>
              <BlindChatView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:userId"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
