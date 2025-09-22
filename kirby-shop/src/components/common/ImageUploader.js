import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';

/**
 * 이미지 업로드 컴포넌트
 * 여러 이미지를 업로드하고 미리보기를 제공합니다.
 */
const ImageUploader = ({ 
  productId, 
  onUploadComplete, 
  onUploadError,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // 파일 개수 체크
    if (fileArray.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }
    
    // 파일 크기 및 타입 체크
    const invalidFiles = fileArray.filter(file => {
      return file.size > maxSize || !acceptedTypes.includes(file.type);
    });
    
    if (invalidFiles.length > 0) {
      setError(`파일 크기는 ${maxSize / (1024 * 1024)}MB 이하이고, 이미지 파일만 업로드 가능합니다.`);
      return;
    }
    
    setError('');
    
    // 미리보기 생성
    const previews = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPreviewImages(previews);
  };

  const handleFileUpload = async () => {
    if (previewImages.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    previewImages.forEach(({ file }) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products/${productId}/images`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          onUploadProgress: (event) => {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          },
        }
      );
      
      onUploadComplete?.(response.data.uploaded_urls);
      setPreviewImages([]);
      
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err.response?.data?.detail || '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePreview = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  };

  const clearAll = () => {
    previewImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setPreviewImages([]);
    setError('');
  };

  return (
    <div className={`image-uploader ${className}`}>
      {/* 파일 선택 영역 */}
      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        
        <div 
          className="upload-dropzone"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <Upload size={24} />
          <p>이미지를 선택하거나 드래그하여 업로드하세요</p>
          <p className="upload-info">
            최대 {maxFiles}개, {maxSize / (1024 * 1024)}MB 이하
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 미리보기 영역 */}
      {previewImages.length > 0 && (
        <div className="preview-area">
          <div className="preview-header">
            <h4>미리보기 ({previewImages.length}개)</h4>
            <button 
              type="button" 
              onClick={clearAll}
              className="clear-btn"
              disabled={uploading}
            >
              모두 지우기
            </button>
          </div>
          
          <div className="preview-grid">
            {previewImages.map(({ preview, name }, index) => (
              <div key={index} className="preview-item">
                <img src={preview} alt={`미리보기 ${index + 1}`} />
                <div className="preview-overlay">
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="remove-btn"
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="preview-name">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업로드 진행률 */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}

      {/* 업로드 버튼 */}
      {previewImages.length > 0 && !uploading && (
        <button
          type="button"
          onClick={handleFileUpload}
          className="upload-btn"
        >
          <ImageIcon size={16} />
          이미지 업로드
        </button>
      )}

      <style jsx>{`
        .image-uploader {
          width: 100%;
        }

        .upload-area {
          margin-bottom: 1rem;
        }

        .upload-dropzone {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .upload-dropzone:hover {
          border-color: #ff69b4;
          background: #fff5f9;
        }

        .upload-dropzone:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-info {
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e74c3c;
          background: #fdf2f2;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .preview-area {
          margin-bottom: 1rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .preview-header h4 {
          margin: 0;
          color: #333;
        }

        .clear-btn {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .clear-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .preview-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .preview-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .preview-overlay {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }

        .remove-btn {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .remove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-name {
          padding: 0.5rem;
          font-size: 0.75rem;
          color: #666;
          margin: 0;
          text-align: center;
          word-break: break-all;
        }

        .upload-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff69b4, #ff1493);
          transition: width 0.3s ease;
        }

        .progress-text {
          display: block;
          text-align: center;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #666;
        }

        .upload-btn {
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
        }

        .upload-btn:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;

