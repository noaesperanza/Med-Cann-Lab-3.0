// src/pages/Home.tsx
import React from "react";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <motion.div
        className="w-full max-w-[700px] h-[600px] p-8 bg-white rounded-xl shadow-xl mx-auto"
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
      >
        {/* Conteúdo do card principal */}
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Bem-vindo ao MedCannLab 3.0
        </h1>
        <div className="flex flex-col h-full">
          {/* Espaço para chat, voz e aprendizado ativo */}
          <div className="flex-grow overflow-auto border border-gray-200 rounded-md p-4 bg-gray-100">
            {/* Aqui vai o componente de chat ou conteúdo dinâmico */}
            <p className="text-gray-600">
              Área de interação principal com a IA, incluindo chat, voz e aprendizado ativo.
            </p>
          </div>
          {/* Input ou controles podem ficar aqui */}
          <div className="mt-4">
            {/* Exemplo de input */}
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;