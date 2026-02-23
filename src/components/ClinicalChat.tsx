import React from 'react'
import ProfessionalChatSystem from './ProfessionalChatSystem'

interface ClinicalChatProps {
    patientId?: string | null
    className?: string
}

const ClinicalChat: React.FC<ClinicalChatProps> = ({ patientId, className }) => {
    return (
        <ProfessionalChatSystem
            className={className}
            selectedPatientId={patientId}
        />
    )
}

export default ClinicalChat
