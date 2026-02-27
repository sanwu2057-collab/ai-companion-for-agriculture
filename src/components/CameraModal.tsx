import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const imageData = canvasRef.current.toDataURL('image/png');
        onCapture(imageData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="glassmorphism p-6 rounded-xl shadow-lg w-11/12 md:w-1/2 lg:w-1/3 text-center">
        <h2 className="text-2xl font-bold font-display text-[var(--color-text-primary)] mb-4">{t('use_camera')}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="relative w-full h-64 bg-gray-800 rounded-xl overflow-hidden mb-4">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        <div className="flex justify-around">
          <button
            onClick={captureImage}
            disabled={!stream}
            className="bg-[var(--color-neon-purple)] text-white py-2 px-4 rounded-full font-display font-semibold hover:bg-[var(--color-neon-blue)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]"
          >
            {t('capture_image')}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white py-2 px-4 rounded-full font-display font-semibold hover:bg-gray-500 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
