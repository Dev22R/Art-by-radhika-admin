import html2pdf from 'html2pdf.js';
import DOMPurify from 'dompurify';

export const generatePricingPdf = (plan, studioInfo) => {
  const cleanFeatures = (plan.features || [])
    .map((f) => `<li style="margin-bottom: 8px; color: #374151;">✨ ${DOMPurify.sanitize(f)}</li>`)
    .join('');

  const rawHtml = `
    <div style="padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #ffffff; max-width: 800px; margin: auto;">
      <div style="border-bottom: 2px solid #b45309; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; color: #78350f; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">NOOR MEHNDI ARTS</h1>
          <p style="margin: 4px 0 0 0; color: #92400e; font-size: 13px;">Luxury Bridal & Celebrity Henna Studio</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
          <p style="margin: 2px 0 0 0;">Quotation Ref: #Q-${Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      <div style="margin-top: 30px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="background: #b45309; color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              Official Bridal Package Quote
            </span>
            <h2 style="margin: 12px 0 4px 0; color: #78350f; font-size: 22px;">${DOMPurify.sanitize(plan.name)}</h2>
            <p style="margin: 0; color: #92400e; font-size: 14px; font-style: italic;">${DOMPurify.sanitize(plan.tagline || '')}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Estimated Package Investment</p>
            <h2 style="margin: 4px 0 0 0; color: #9a3412; font-size: 28px; font-weight: 800;">₹${Number(plan.price).toLocaleString('en-IN')}</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #059669; font-weight: 600;">Advance Deposit: ${plan.depositPercent || 30}% Required</p>
          </div>
        </div>

        <div style="margin-top: 24px; border-top: 1px dashed #d97706; padding-top: 20px;">
          <h3 style="font-size: 15px; color: #78350f; margin: 0 0 12px 0; font-weight: 700;">Package Inclusions & Features:</h3>
          <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
            ${cleanFeatures}
          </ul>
        </div>
      </div>

      <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; color: #4b5563;">
        <div>
          <h4 style="margin: 0 0 4px 0; color: #1f2937;">Studio Contact</h4>
          <p style="margin: 2px 0;">📞 ${studioInfo?.phone || '+91 98765 00000'}</p>
          <p style="margin: 2px 0;">✉️ ${studioInfo?.email || 'admin@noormehndiarts.com'}</p>
          <p style="margin: 2px 0;">📍 ${studioInfo?.address || 'Jaipur, Rajasthan'}</p>
        </div>
        <div style="text-align: right; max-width: 320px;">
          <h4 style="margin: 0 0 4px 0; color: #1f2937;">Booking Terms</h4>
          <p style="margin: 2px 0;">${plan.bookingWindow || 'Book in advance'}</p>
          <p style="margin: 2px 0;">100% Organic Henna paste brewed freshly before wedding date.</p>
        </div>
      </div>

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af;">
        Thank you for choosing Noor Mehndi Arts • Handcrafted with love & organic botanical henna
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${plan.name.replace(/\s+/g, '_')}_Quotation.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const element = document.createElement('div');
  element.innerHTML = rawHtml;
  return html2pdf().set(opt).from(element).save();
};
