import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { DashboardStats } from './components/Dashboard';
import { EmailPreview } from './components/EmailPreview';
import { Mail, Eye } from 'lucide-react';
import type { FileUploadState, Attachment } from './types';
import { processTemplate, processRecipients, getAttachmentType, createObjectURL, replacePlaceholders } from './utils/fileProcessing';
import { sendEmail } from './utils/emailService';

function App() {
  const [files, setFiles] = useState<FileUploadState>({
    template: null,
    recipients: null,
    attachments: []
  });

  const [emailData, setEmailData] = useState<{
    subject: string;
    content: string;
    recipients: Array<{ [key: string]: string }>;
  }>({
    subject: '',
    content: '',
    recipients: []
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    return () => {
      attachmentPreviews.forEach(attachment => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachmentPreviews]);

  const handleTemplateUpload = async (uploadedFiles: File[]) => {
    const templateFile = uploadedFiles[0];
    setFiles(prev => ({ ...prev, template: templateFile }));
    
    try {
      const { subject, content } = await processTemplate(templateFile);
      setEmailData(prev => ({ ...prev, subject, content }));
    } catch (error) {
      console.error('Error processing template:', error);
    }
  };

  const handleRecipientsUpload = async (uploadedFiles: File[]) => {
    const recipientsFile = uploadedFiles[0];
    setFiles(prev => ({ ...prev, recipients: recipientsFile }));
    
    try {
      const recipients = await processRecipients(recipientsFile);
      setEmailData(prev => ({ ...prev, recipients }));
    } catch (error) {
      console.error('Error processing recipients:', error);
    }
  };

  const handleAttachmentsUpload = (uploadedFiles: File[]) => {
    const newAttachments = uploadedFiles.map(file => ({
      file,
      type: getAttachmentType(file),
      preview: file.type.startsWith('image/') ? createObjectURL(file) : undefined
    }));

    setAttachmentPreviews(prev => [...prev, ...newAttachments]);
    setFiles(prev => ({ ...prev, attachments: [...prev.attachments, ...uploadedFiles] }));
  };

  const handleSendCampaign = async () => {
    if (!emailData.recipients.length) {
      alert('Please upload recipient data first');
      return;
    }

    setSending(true);
    let sent = 0;

    for (const recipient of emailData.recipients) {
      try {
        const result = await sendEmail({
          to: recipient.email,
          subject: replacePlaceholders(emailData.subject, recipient),
          html: replacePlaceholders(emailData.content, recipient),
          attachments: files.attachments
        });

        if (result.success) {
          sent++;
          setSentCount(sent);
        }
      } catch (error) {
        console.error('Error sending email to', recipient.email, error);
      }
    }

    setSending(false);
    alert(`Successfully sent ${sent} out of ${emailData.recipients.length} emails`);
  };

  const handlePreviewNext = () => {
    setPreviewIndex(prev => 
      prev < emailData.recipients.length - 1 ? prev + 1 : prev
    );
  };

  const handlePreviewPrevious = () => {
    setPreviewIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Mail className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Email Campaign Manager</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats
          recipients={emailData.recipients.length}
          attachments={files.attachments.length}
          emailsSent={sentCount}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Email Template</h2>
              <FileUpload
                onFileUpload={handleTemplateUpload}
                accept={{
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                }}
                label="Upload Template (DOCX/XLSX)"
              />
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recipient Data</h2>
              <FileUpload
                onFileUpload={handleRecipientsUpload}
                accept={{
                  'text/csv': ['.csv'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                }}
                label="Upload Recipients (CSV/XLSX)"
              />
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Attachments</h2>
              <FileUpload
                onFileUpload={handleAttachmentsUpload}
                accept={{
                  'application/pdf': ['.pdf'],
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                }}
                multiple={true}
                label="Upload Attachments"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
            {files.template ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Template: {files.template.name}</p>
                {files.recipients && (
                  <p className="text-sm text-gray-600">Recipients: {files.recipients.name}</p>
                )}
                {attachmentPreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {attachmentPreviews.map((attachment, index) => (
                        <div key={index} className="border rounded p-2 flex items-center space-x-2">
                          {attachment.type === 'image' && attachment.preview ? (
                            <img
                              src={attachment.preview}
                              alt={attachment.file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Mail className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 truncate">{attachment.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {emailData.recipients.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Preview email {previewIndex + 1} of {emailData.recipients.length}
                    </div>
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        onClick={handlePreviewPrevious}
                        disabled={previewIndex === 0}
                      >
                        Previous
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        onClick={handlePreviewNext}
                        disabled={previewIndex === emailData.recipients.length - 1}
                      >
                        Next
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-1"
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  className={`w-full ${
                    sending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white py-2 px-4 rounded-md transition-colors mt-4`}
                  onClick={handleSendCampaign}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Mail'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Upload a template to preview your campaign</p>
            )}
          </div>
        </div>
      </main>

      {showPreview && emailData.recipients.length > 0 && (
        <EmailPreview
          subject={emailData.subject}
          content={emailData.content}
          attachments={attachmentPreviews}
          recipient={emailData.recipients[previewIndex]}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default App;