import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const UserTypeDebug: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return <div className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded z-50">Usuário não logado</div>
  }

  return (
    <div className="fixed top-4 left-4 bg-blue-500 text-white p-3 rounded z-50 max-w-sm">
      <h3 className="font-bold">Debug - Tipo de Usuário</h3>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Tipo:</strong> {user.type}</p>
      <p><strong>Nome:</strong> {user.name}</p>
      <p><strong>ID:</strong> {user.id}</p>
      <div className="mt-2">
        <p className="text-sm">
          <strong>Esperado:</strong> admin<br/>
          <strong>Atual:</strong> {user.type}<br/>
          <strong>Status:</strong> {user.type === 'admin' ? '✅ Correto' : '❌ Incorreto'}
        </p>
      </div>
    </div>
  )
}

export default UserTypeDebug
