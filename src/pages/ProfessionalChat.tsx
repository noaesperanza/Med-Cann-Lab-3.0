import React from 'react'
import Layout from '../components/Layout'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'

const ProfessionalChat: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">👥 Chat com Profissionais</h1>
          <p className="text-slate-400">
            Comunicação segura entre consultórios da plataforma MedCannLab
          </p>
        </div>
        
        <ProfessionalChatSystem />
      </div>
    </Layout>
  )
}

export default ProfessionalChat
