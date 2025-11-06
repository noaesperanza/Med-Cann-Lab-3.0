
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { NoaProvider } from './contexts/NoaContext'
import { NoaPlatformProvider } from './contexts/NoaPlatformContext'
import { RealtimeProvider } from './contexts/RealtimeContext'
import { UserViewProvider } from './contexts/UserViewContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import SmartDashboardRedirect from './components/SmartDashboardRedirect'
import RedirectIndividualizado from './components/RedirectIndividualizado'
import NavegacaoIndividualizada from './components/NavegacaoIndividualizada'
import EixoRotaRedirect from './components/EixoRotaRedirect'
import Breadcrumbs from './components/Breadcrumbs'
import EixoSelector from './components/EixoSelector'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import StudyArea from './pages/StudyArea'
import Library from './pages/Library'
import ChatGlobal from './pages/ChatGlobal'
import PatientChat from './pages/PatientChat'
import ForumCasosClinicos from './pages/ForumCasosClinicos'
import Gamificacao from './pages/Gamificacao'
import Profile from './pages/Profile'
import AdminSettings from './pages/AdminSettings'
import AdminDashboardWrapper from './components/AdminDashboardWrapper'
import ExperienciaPaciente from './pages/ExperienciaPaciente'
import CursoEduardoFaveret from './pages/CursoEduardoFaveret'
import CursoJardinsDeCura from './pages/CursoJardinsDeCura'
import TermosLGPD from './pages/TermosLGPD'
import TestPage from './pages/TestPage'
import AIDocumentChat from './pages/AIDocumentChat'
import Patients from './pages/Patients'
import Evaluations from './pages/Evaluations'
import Reports from './pages/Reports'
import DebateRoom from './pages/DebateRoom'
import PatientDoctorChat from './pages/PatientDoctorChat'
import PatientProfile from './pages/PatientProfile'
import ProfessionalScheduling from './pages/ProfessionalScheduling'
import PatientAppointments from './pages/PatientAppointments'
import PatientNOAChat from './pages/PatientNOAChat'
import ArteEntrevistaClinica from './pages/ArteEntrevistaClinica'
import PatientDashboard from './pages/PatientDashboard'
import PatientAgenda from './pages/PatientAgenda'
import PatientKPIs from './pages/PatientKPIs'
import ProfessionalDashboard from './pages/ProfessionalDashboard'
import AlunoDashboard from './pages/AlunoDashboard'
import ClinicaDashboard from './pages/ClinicaDashboard'
import EnsinoDashboard from './pages/EnsinoDashboard'
import GestaoAlunos from './pages/GestaoAlunos'
import PesquisaDashboard from './pages/PesquisaDashboard'
import CidadeAmigaDosRins from './pages/CidadeAmigaDosRins'
import MedCannLab from './pages/MedCannLab'
import JardinsDeCura from './pages/JardinsDeCura'
import AdminDashboard from './pages/AdminDashboard'
import MedCannLabStructure from './pages/MedCannLabStructure'
import NotFound from './pages/NotFound'
import ClinicalAssessment from './pages/ClinicalAssessment'
import PatientOnboarding from './pages/PatientOnboarding'
import Scheduling from './pages/Scheduling'
import Prescriptions from './pages/Prescriptions'
import PatientsManagement from './pages/PatientsManagement'
import NewPatientForm from './pages/NewPatientForm'
import ProfessionalChat from './pages/ProfessionalChat'
import { SubscriptionPlans } from './pages/SubscriptionPlans'
import { PaymentCheckout } from './pages/PaymentCheckout'
import { LessonPreparation } from './pages/LessonPreparation'
import { ProfessionalFinancial } from './pages/ProfessionalFinancial'
import EduardoFaveretDashboard from './pages/EduardoFaveretDashboard'
import RicardoValencaDashboard from './pages/RicardoValencaDashboard'
import PatientManagementAdvanced from './pages/PatientManagementAdvanced'

function App() {
  return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <UserViewProvider>
              <ToastProvider>
                <NoaProvider>
                  <NoaPlatformProvider>
                    <RealtimeProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/termos-lgpd" element={<TermosLGPD />} />
              <Route path="/experiencia-paciente" element={<ExperienciaPaciente />} />
              <Route path="/curso-eduardo-faveret" element={<CursoEduardoFaveret />} />
              <Route path="/curso-jardins-de-cura" element={<CursoJardinsDeCura />} />
              <Route path="/patient-onboarding" element={<PatientOnboarding />} />
              
              {/* Rotas estruturadas por eixo e tipo */}
              <Route path="/eixo/:eixo/tipo/:tipo" element={<EixoRotaRedirect />} />
              
              {/* Seletor de eixo */}
              <Route path="/selecionar-eixo" element={<EixoSelector />} />
              
        <Route path="/app" element={<Layout />}>
          <Route index element={<SmartDashboardRedirect />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="home" element={<SmartDashboardRedirect />} />
          <Route path="test" element={<TestPage />} />
          <Route path="eduardo-faveret-dashboard" element={<EduardoFaveretDashboard />} />
          <Route path="ricardo-valenca-dashboard" element={<RicardoValencaDashboard />} />
          <Route path="patient-management-advanced" element={<PatientManagementAdvanced />} />
                
                {/* Rotas Individualizadas por Eixo e Tipo */}
                {/* EIXO CLÍNICA */}
                <Route path="clinica/profissional/dashboard" element={<ProtectedRoute requiredRole="profissional"><RicardoValencaDashboard /></ProtectedRoute>} />
                <Route path="clinica/profissional/dashboard-eduardo" element={<EduardoFaveretDashboard />} />
                <Route path="clinica/profissional/pacientes" element={<PatientsManagement />} />
                <Route path="clinica/profissional/agendamentos" element={<ProfessionalScheduling />} />
                <Route path="clinica/profissional/relatorios" element={<Reports />} />
                <Route path="clinica/profissional/chat-pacientes" element={<ProfessionalChat />} />
                <Route path="clinica/profissional/chat-profissionais" element={<ProfessionalChat />} />
                
                <Route path="clinica/paciente/dashboard" element={<PatientDashboard />} />
                <Route path="clinica/paciente/avaliacao-clinica" element={<ClinicalAssessment />} />
                <Route path="clinica/paciente/relatorios" element={<Reports />} />
                <Route path="clinica/paciente/agendamentos" element={<PatientAppointments />} />
                <Route path="clinica/paciente/agenda" element={<PatientAgenda />} />
                <Route path="clinica/paciente/chat-profissional" element={<PatientDoctorChat />} />
                <Route path="clinica/paciente/chat-profissional/:patientId" element={<PatientDoctorChat />} />
                
                {/* EIXO ENSINO */}
                <Route path="ensino/profissional/dashboard" element={<EnsinoDashboard />} />
                <Route path="ensino/profissional/preparacao-aulas" element={<LessonPreparation />} />
                <Route path="ensino/profissional/arte-entrevista-clinica" element={<ArteEntrevistaClinica />} />
                <Route path="ensino/profissional/pos-graduacao-cannabis" element={<CursoEduardoFaveret />} />
                <Route path="ensino/profissional/gestao-alunos" element={<GestaoAlunos />} />
                
                <Route path="ensino/aluno/dashboard" element={<AlunoDashboard />} />
                <Route path="ensino/aluno/cursos" element={<Courses />} />
                <Route path="ensino/aluno/inscricao-cursos" element={<Courses />} />
                <Route path="ensino/aluno/biblioteca" element={<Library />} />
                <Route path="ensino/aluno/gamificacao" element={<Gamificacao />} />
                
                {/* EIXO PESQUISA */}
                <Route path="pesquisa/profissional/dashboard" element={<PesquisaDashboard />} />
                <Route path="pesquisa/profissional/forum-casos" element={<ForumCasosClinicos />} />
                <Route path="pesquisa/profissional/cidade-amiga-dos-rins" element={<CidadeAmigaDosRins />} />
                <Route path="pesquisa/profissional/medcann-lab" element={<MedCannLab />} />
                <Route path="pesquisa/profissional/jardins-de-cura" element={<JardinsDeCura />} />
                
                <Route path="pesquisa/aluno/dashboard" element={<PesquisaDashboard />} />
                <Route path="pesquisa/aluno/forum-casos" element={<ForumCasosClinicos />} />
                
                {/* Rotas Legadas (para compatibilidade) */}
                <Route path="patient-dashboard" element={<PatientDashboard />} />
                <Route path="patient-agenda" element={<PatientAgenda />} />
                <Route path="patient-kpis" element={<PatientKPIs />} />
                <Route path="professional-dashboard" element={<ProfessionalDashboard />} />
                <Route path="aluno-dashboard" element={<AlunoDashboard />} />
                <Route path="clinica-dashboard" element={<ClinicaDashboard />} />
                <Route path="ensino-dashboard" element={<EnsinoDashboard />} />
                <Route path="pesquisa-dashboard" element={<PesquisaDashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="arte-entrevista-clinica" element={<ArteEntrevistaClinica />} />
                <Route path="study-area" element={<StudyArea />} />
                <Route path="library" element={<Library />} />
                <Route path="chat" element={<ChatGlobal />} />
                <Route path="chat-noa-esperanca" element={<PatientNOAChat />} />
                <Route path="patient-chat" element={<PatientChat />} />
                    <Route path="forum" element={<ForumCasosClinicos />} />
                <Route path="gamificacao" element={<Gamificacao />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin-settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="ai-documents" element={<AIDocumentChat />} />
                <Route path="evaluations" element={<Evaluations />} />
                <Route path="reports" element={<Reports />} />
                <Route path="debate/:debateId" element={<DebateRoom />} />
                <Route path="patient-chat/:patientId" element={
                  <ProtectedRoute requiredRole="profissional">
                    <PatientDoctorChat />
                  </ProtectedRoute>
                } />
                <Route path="patient/:patientId" element={<PatientProfile />} />
                <Route path="appointments" element={<Profile />} />
                <Route path="scheduling" element={<Scheduling />} />
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="patients" element={<PatientsManagement />} />
                <Route path="new-patient" element={<NewPatientForm />} />
                <Route path="professional-scheduling" element={
                  <ProtectedRoute requiredRole="profissional">
                    <ProfessionalScheduling />
                  </ProtectedRoute>
                } />
                <Route path="patient-appointments" element={
                  <ProtectedRoute requiredRole="paciente">
                    <PatientAppointments />
                  </ProtectedRoute>
                } />
                <Route path="patient-noa-chat" element={
                  <ProtectedRoute requiredRole="paciente">
                    <PatientNOAChat />
                  </ProtectedRoute>
                } />
                <Route path="clinical-assessment" element={
                  <ProtectedRoute requiredRole="paciente">
                    <ClinicalAssessment />
                  </ProtectedRoute>
                } />
                <Route path="professional-chat" element={
                  <ProtectedRoute requiredRole="profissional">
                    <ProfessionalChat />
                  </ProtectedRoute>
                } />
                <Route path="subscription-plans" element={<SubscriptionPlans />} />
                <Route path="checkout" element={<PaymentCheckout />} />
                <Route path="lesson-prep" element={<LessonPreparation />} />
                <Route path="professional-financial" element={<ProfessionalFinancial />} />
                <Route path="admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/courses" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/analytics" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/system" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/upload" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/chat" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/forum" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/gamification" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/renal" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/unification" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
                <Route path="admin/financial" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardWrapper />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
                    </RealtimeProvider>
                  </NoaPlatformProvider>
                </NoaProvider>
              </ToastProvider>
            </UserViewProvider>
          </AuthProvider>
        </BrowserRouter>
  )
}

export default App