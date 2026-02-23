import React, { useState } from 'react';

interface MobileChatInputProps {
  onSend: (message: string) => void;
}

const MobileChatInput: React.FC<MobileChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex items-center w-full p-2 bg-slate-800 rounded-lg shadow-lg">
      <input
        type="text"
        className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white focus:outline-none"
        placeholder="Digite sua mensagem..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        onClick={handleSend}
      >Enviar</button>
    </div>
  );
};

export default MobileChatInput;
