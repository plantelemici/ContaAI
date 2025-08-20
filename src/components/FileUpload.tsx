import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, FileX, Contact as FileContract, CreditCard } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onContractUpload?: (file: File) => void;
  onBankStatementUpload?: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  onContractUpload,
  onBankStatementUpload,
  isProcessing 
}) => {
  const detectFileType = (file: File): 'document' | 'contract' | 'bank' => {
    const fileName = file.name.toLowerCase();
    
    // Detectare contracte
    if (fileName.includes('contract') || fileName.includes('acord') || fileName.includes('conventie')) {
      return 'contract';
    }
    
    // Detectare extrase bancare
    if (fileName.includes('extras') || fileName.includes('statement') || fileName.includes('sold') || 
        fileName.includes('banca') || fileName.includes('bank') || fileName.includes('cont')) {
      return 'bank';
    }
    
    return 'document';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const fileType = detectFileType(file);
      
      switch (fileType) {
        case 'contract':
          if (onContractUpload) {
            onContractUpload(file);
          } else {
            onFileUpload(file);
          }
          break;
        case 'bank':
          if (onBankStatementUpload) {
            onBankStatementUpload(file);
          } else {
            onFileUpload(file);
          }
          break;
        default:
          onFileUpload(file);
      }
    });
  }, [onFileUpload, onContractUpload, onBankStatementUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isProcessing
  });

  const getIcon = () => {
    if (isDragReject) return <FileX className="w-12 h-12 text-red-400" />;
    if (isDragAccept) return <FileText className="w-12 h-12 text-green-400" />;
    return <Upload className="w-12 h-12 text-blue-400" />;
  };

  const getText = () => {
    if (isDragReject) return 'Tip de fișier neacceptat';
    if (isDragActive) return 'Eliberează pentru încărcare...';
    if (isProcessing) return 'Se procesează documentele...';
    return 'Trage documentele aici sau click pentru selectare';
  };

  const getSubtext = () => {
    if (isDragReject) return 'Acceptăm doar imagini și documente PDF';
    return 'Facturi, contracte, extrase bancare (PNG, JPG, PDF, DOC, DOCX)';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragAccept
            ? 'border-green-400 bg-green-500/10'
            : isDragReject
            ? 'border-red-400 bg-red-500/10'
            : isDragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-600 bg-white/5 backdrop-blur-xl hover:bg-white/10'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {getIcon()}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {getText()}
            </h3>
            <p className="text-gray-400">
              {getSubtext()}
            </p>
          </div>
          {!isDragActive && !isProcessing && (
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
              Selectează Fișiere
            </button>
          )}
        </div>
      </div>

      {/* Auto-Distribution Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-blue-400 font-medium mb-2">Distribuire Automată</h4>
        <p className="text-gray-300 text-sm mb-3">
          Documentele sunt distribuite automat în funcție de conținut:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <FileContract className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">Contracte → Pagina Contracte</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300">Extrase → Reconciliere</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Facturi → Documente</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Image className="w-6 h-6 text-blue-400" />
            <span className="text-white font-medium">Imagini</span>
          </div>
          <p className="text-gray-400 text-sm">PNG, JPG, JPEG, GIF</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-red-400" />
            <span className="text-white font-medium">PDF</span>
          </div>
          <p className="text-gray-400 text-sm">Documente PDF</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-green-400" />
            <span className="text-white font-medium">Word</span>
          </div>
          <p className="text-gray-400 text-sm">DOC, DOCX</p>
        </div>
      </div>
    </div>
  );
};