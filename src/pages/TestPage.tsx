import React from 'react'

const TestPage: React.FC = () => {
  return (
    <div className="bg-slate-900 p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">TESTE - PÁGINA FUNCIONANDO!</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">Se você está vendo isso, o roteamento está funcionando!</p>
      <div className="bg-red-600 text-white p-6 rounded-lg mb-6">
        CARD VERMELHO - SE VISÍVEL, O CSS ESTÁ FUNCIONANDO!
      </div>
    </div>
  )
}

export default TestPage
