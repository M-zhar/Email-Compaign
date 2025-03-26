interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments: File[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  try {
    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    
    // Add each attachment to the FormData
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    console.log('Sending email to:', to);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}