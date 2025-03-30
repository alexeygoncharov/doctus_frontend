"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera, FlipHorizontal, Check } from "lucide-react";
import { FileData } from "@/lib/types";

interface CameraModalProps {
  onCapture: (capturedImages: FileData[]) => void;
  onClose: () => void;
  open: boolean;
}

export function CameraModal({ open, onClose, onCapture }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [capturedImages, setCapturedImages] = useState<FileData[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get available cameras
  useEffect(() => {
    if (open) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setDevices(videoDevices);
          
          // Default to the front camera on mobile if available (usually the second camera)
          const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
          if (isMobile && videoDevices.length > 1) {
            // On mobile, try to use front camera (usually has "front" in the label)
            const frontCamera = videoDevices.find(device => 
              device.label.toLowerCase().includes('front') || 
              device.label.toLowerCase().includes('selfie')
            );
            setSelectedDeviceId(frontCamera?.deviceId || videoDevices[0].deviceId);
          } else if (videoDevices.length > 0) {
            setSelectedDeviceId(videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error("Error enumerating devices:", err);
        });
    }
  }, [open]);

  // Start camera when device selected
  useEffect(() => {
    if (selectedDeviceId && open) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedDeviceId, open]);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup function for when modal is closed
  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: "user",
          height: { ideal: 720 },
          width: { ideal: 1280 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      stopCamera();
      setSelectedDeviceId(devices[nextIndex].deviceId);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && stream) {
      setIsCapturing(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const timestamp = Date.now();
            const newImage: FileData = {
              name: `photo_${timestamp}.jpg`,
              size: blob.size,
              type: 'image/jpeg',
              url: url
            };
            
            setCapturedImages(prev => [...prev, newImage]);
          }
          setIsCapturing(false);
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleConfirm = () => {
    onCapture(capturedImages);
    setCapturedImages([]);
    stopCamera();
    onClose();
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog onOpenChange={(openState) => {
      if (!openState) {
        setCapturedImages([]);
        stopCamera();
        onClose();
      }
    }} open={open}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Сделать фото</DialogTitle>
          <Button 
            className="absolute right-4 top-4 z-10" 
            onClick={() => {
              stopCamera();
              onClose();
            }} 
            size="icon" 
            variant="outline"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto mt-4">
          {devices.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-center">
              <div>
                <p className="text-red-500 mb-2">Камера недоступна</p>
                <p className="text-sm text-gray-500">Пожалуйста, разрешите доступ к камере в настройках браузера</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera preview */}
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video 
                  autoPlay 
                  className={`w-full h-full object-cover ${isCapturing ? 'opacity-50' : ''}`} 
                  muted 
                  playsInline 
                  ref={videoRef}
                />
                <canvas className="hidden" ref={canvasRef} />
                
                {devices.length > 1 && (
                  <Button 
                    className="absolute left-2 bottom-2 bg-opacity-70 backdrop-blur-sm" 
                    onClick={switchCamera} 
                    size="sm"
                    variant="secondary"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-1" />
                    Сменить камеру
                  </Button>
                )}
              </div>
              
              {/* Capture button */}
              <div className="flex justify-center">
                <Button 
                  className="rounded-full h-14 w-14 p-0 bg-blue-500 hover:bg-blue-600" 
                  disabled={isCapturing || !stream} 
                  onClick={captureImage}
                  size="lg"
                  variant="default"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Captured images */}
              {capturedImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Сделанные фото ({capturedImages.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {capturedImages.map((image, index) => (
                      <div className="relative aspect-square rounded-md overflow-hidden" key={image.url}>
                        <img 
                          alt={`Captured ${index}`} 
                          className="w-full h-full object-cover" 
                          src={image.url}
                        />
                        <Button 
                          className="absolute top-1 right-1 h-6 w-6 rounded-full" 
                          onClick={() => removeImage(index)} 
                          size="icon"
                          variant="destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {capturedImages.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              onClick={() => setCapturedImages([])} 
              variant="outline"
            >
              Очистить
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="default"
            >
              <Check className="h-4 w-4 mr-1" />
              Отправить ({capturedImages.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}