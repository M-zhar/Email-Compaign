import React from 'react';
import { X, Paperclip, FileText, File } from 'lucide-react';
import type { Attachment } from '../types';
import { replacePlaceholders } from '../utils/fileProcessing';

interface EmailPreviewProps {
  subject: string;
  content: string;
  attachments: Attachment[];
  recipient?: {
    name: string;
    email: string;
    [key: string]: string;
  };
  onClose: () => void;
}

export function EmailPreview({ subject, content, attachments, recipient, onClose }: EmailPreviewProps) {
  const processedSubject = recipient ? replacePlaceholders(subject, recipient) : subject;
  const processedContent = recipient ? replacePlaceholders(content, recipient) : content;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">To: {recipient?.email || 'example@email.com'}</p>
            <p className="text-xl font-medium">{processedSubject}</p>
          </div>
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: processedContent
            }} 
          />

          {attachments.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({attachments.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    {attachment.type === 'image' && attachment.preview ? (
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={attachment.preview}
                          alt={attachment.file.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                        {attachment.type === 'document' ? (
                          <FileText className="w-8 h-8 text-gray-400" />
                        ) : (
                          <File className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 truncate" title={attachment.file.name}>
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {recipient && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient Data:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(recipient).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}