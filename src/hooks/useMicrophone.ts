import { useState, useRef } from 'react';

export function useMicrophone() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);
      setIsRecording(true);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };
      mediaRecorder.onstop = () => {
        setIsRecording(false);
      };
      mediaRecorder.start();
    } catch (err) {
      alert('Permissão para microfone negada ou erro ao iniciar gravação.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getAudioBlob = () => {
    if (audioChunks.length > 0) {
      return new Blob(audioChunks, { type: 'audio/webm' });
    }
    return null;
  };

  return { isRecording, startRecording, stopRecording, getAudioBlob };
}
