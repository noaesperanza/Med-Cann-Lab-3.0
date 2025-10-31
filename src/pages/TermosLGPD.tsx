import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Shield, Lock, Eye, FileText, User, Database, Globe } from 'lucide-react'

const TermosLGPD: React.FC = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedDataSharing, setAcceptedDataSharing] = useState(false)
  const [acceptedMedicalConsultation, setAcceptedMedicalConsultation] = useState(false)

  const canProceed = acceptedTerms && acceptedDataSharing && acceptedMedicalConsultation

  const handleAcceptAll = () => {
    setAcceptedTerms(true)
    setAcceptedDataSharing(true)
    setAcceptedMedicalConsultation(true)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Termos de Uso e LGPD
            </h1>
            <p className="text-xl text-gray-600">
              Consentimento para uso de dados sensíveis e consulta médica especializada
            </p>
          </div>

          {/* Terms Cards */}
          <div className="space-y-8">
            {/* Termos de Uso */}
            <div className="card p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Termos de Uso da Plataforma
                  </h2>
                  <div className="prose max-w-none text-gray-600 space-y-4">
                    <p>
                      Ao utilizar a plataforma MedCannLab, você concorda com os seguintes termos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Uso responsável da plataforma para fins médicos e educacionais</li>
                      <li>Não compartilhamento de informações com terceiros não autorizados</li>
                      <li>Responsabilidade pela veracidade das informações fornecidas</li>
                      <li>Uso adequado das funcionalidades de IA e avaliação clínica</li>
                      <li>Respeito às diretrizes éticas e profissionais da medicina</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Li e aceito os Termos de Uso
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* LGPD e Dados Sensíveis */}
            <div className="card p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Consentimento LGPD - Dados Sensíveis
                  </h2>
                  <div className="prose max-w-none text-gray-600 space-y-4">
                    <p>
                      Conforme a Lei Geral de Proteção de Dados (LGPD), solicitamos seu consentimento 
                      para o tratamento de dados sensíveis relacionados à sua saúde:
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Dados que serão coletados:</h3>
                      <ul className="list-disc pl-6 text-yellow-700 space-y-1">
                        <li>Informações de saúde e histórico médico</li>
                        <li>Resultados de avaliações clínicas</li>
                        <li>Dados de consultas e tratamentos</li>
                        <li>Informações de exames e prescrições</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Finalidade do tratamento:</h3>
                      <ul className="list-disc pl-6 text-blue-700 space-y-1">
                        <li>Prestação de serviços médicos especializados</li>
                        <li>Geração de relatórios clínicos personalizados</li>
                        <li>Integração com profissionais parceiros</li>
                        <li>Melhoria contínua da plataforma</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedDataSharing}
                        onChange={(e) => setAcceptedDataSharing(e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Autorizo o tratamento de meus dados sensíveis conforme LGPD
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Consulta Médica Especializada */}
            <div className="card p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Consulta Médica Especializada
                  </h2>
                  <div className="prose max-w-none text-gray-600 space-y-4">
                    <p>
                      Para oferecer consultas médicas especializadas, precisamos de sua autorização 
                      para compartilhamento de dados com profissionais parceiros:
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Compartilhamento autorizado:</h3>
                      <ul className="list-disc pl-6 text-purple-700 space-y-1">
                        <li>Profissionais médicos parceiros da plataforma</li>
                        <li>Especialistas em cannabis medicinal</li>
                        <li>Equipe de suporte clínico</li>
                        <li>Profissionais para segunda opinião médica</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-900 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Seus direitos:</h3>
                      <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>Acesso aos seus dados a qualquer momento</li>
                        <li>Correção de informações incorretas</li>
                        <li>Exclusão de dados (direito ao esquecimento)</li>
                        <li>Portabilidade de dados</li>
                        <li>Revogação do consentimento</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedMedicalConsultation}
                        onChange={(e) => setAcceptedMedicalConsultation(e.target.checked)}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Autorizo consultas médicas especializadas com profissionais parceiros
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Aceitar Todos os Termos
              </button>
              
              <Link
                to="/dashboard"
                className={`px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center ${
                  canProceed
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={(e) => !canProceed && e.preventDefault()}
              >
                <Eye className="w-5 h-5 mr-2" />
                Continuar para Dashboard
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Você pode revogar seu consentimento a qualquer momento nas configurações da conta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermosLGPD
