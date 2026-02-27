import { useState, useRef, useCallback } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraScannerProps {
  onClose: () => void;
  onCropIdentified: (crop: string) => void;
}

export default function CameraScanner({ onClose, onCropIdentified }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access the camera. Please check permissions.');
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        // Here you would typically send this to an AI model for identification
        // For this demo, we'll simulate a result
        const identifiedCrop = 'Simulated Crop'; // Replace with actual AI call
        onCropIdentified(identifiedCrop);
        stopCamera();
        onClose();
      }
    }
  };

  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-lg p-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="absolute top-4 right-4">
          <button onClick={() => { stopCamera(); onClose(); }} className="text-white bg-black bg-opacity-50 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button onClick={captureImage} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"></button>
        </div>
      </div>
    </div>
  );
}
