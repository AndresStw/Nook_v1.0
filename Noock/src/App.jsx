import { Routes, Route, Navigate } from "react-router-dom";
import EventsPage from "./pages/EventsPage";
import Landing from "./pages/Landing";
import VerifyEmail from "./pages/VerifyEmail";
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
import AdminPanel from "./pages/AdminPanel";
import AdminRoute from "./components/auth/AdminRoute";
import SupportMessageBanner from "./components/support/SupportMessageBanner";
import DiscoveryToast from "./components/ui/DiscoveryToast";

//Componente principal
export default function App() {
  return (
    <>
      <BlindChatInvite />
      <ReportBugButton />
      <SupportMessageBanner />
      <DiscoveryToast />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<TestConnection />} />

        {/* Onboarding (requiere sesión pero NO requiere onboarding completo) */}
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute
              requireOnboarding={false}
              requireVerification={false}
            >
              <VerifyEmail />
            </ProtectedRoute>
          }
        />

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
          path="/admin-nook-kevin-2026"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute requireCompleteProfile>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute requireCompleteProfile>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute requireCompleteProfile>
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireCompleteProfile>
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
