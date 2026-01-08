export const sendApprovalEmail = async (studentEmail: string, courseName: string) => {
  const RESEND_API_KEY = 'REPLACE_WITH_YOUR_RESEND_API_KEY';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Itqan Academy <onboarding@resend.dev>',
        to: [studentEmail],
        subject: '🎉 Payment Approved - Course Unlocked!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 24px;">
            <h1 style="color: #2563eb; text-align: center;">Congratulations!</h1>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              Your payment for <strong>"${courseName}"</strong> has been verified and approved.
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #1e293b;">Course Details:</p>
              <p style="margin: 5px 0; color: #64748b;">Name: ${courseName}</p>
              <p style="margin: 5px 0; color: #64748b;">Status: Unlocked</p>
            </div>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              You can now access your course from your student dashboard.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://itqan-platform.vercel.app/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
            </div>
            <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              Itqan Academy - Empowering your future through knowledge.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('📧 Resend Error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    console.log('📧 Email sent successfully via Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    return { success: false, error };
  }
};
