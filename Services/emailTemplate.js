const createEmailTemplate = (
  userName,
  title,
  content,
  ctaText = null,
  ctaLink = null,
  propertyTitle = null
) => {
  const ctaButton =
    ctaText && ctaLink
      ? `<a href="${ctaLink}" class="cta-button">${ctaText}</a>`
      : "";

  const propertyCard = propertyTitle
    ? `<div class="divider"></div>
     <div class="property-card">
       <div class="property-title">🏡 ${propertyTitle}</div>
       <div class="message" style="margin: 0;">
         Your property listing is now live and ready to welcome guests!
       </div>
     </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background-color: #f8f9fa; padding: 20px; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 40px 30px; text-align: center; position: relative; }
            .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="5" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="30" cy="15" r="0.3" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="8" r="0.4" fill="rgba(255,255,255,0.1)"/><circle cx="70" cy="12" r="0.2" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="3" r="0.3" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="20" fill="url(%23grain)"/></svg>'); opacity: 0.3; }
            .logo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); margin-bottom: 20px; position: relative; z-index: 1; }
            .brand-name { font-size: 32px; font-weight: bold; color: #2c3e50; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); position: relative; z-index: 1; }
            .tagline { font-size: 16px; color: #5a5a5a; font-weight: 500; position: relative; z-index: 1; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .greeting { font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 20px; }
            .message { font-size: 16px; color: #4a5568; margin-bottom: 15px; line-height: 1.7; }
            .highlight { color: #ffd700; font-weight: 600; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #2c3e50; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); transition: all 0.3s ease; border: 2px solid transparent; }
            .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4); border-color: #ffed4e; }
            .property-card { background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%); border: 2px solid #ffd700; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.1); }
            .property-title { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 10px; }
            .divider { height: 2px; background: linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%); margin: 30px 0; }
            .footer { background: linear-gradient(135deg, #2c3e50 0%, #3a4a5c 100%); color: #ffffff; padding: 30px; text-align: center; }
            .footer h3 { color: #ffd700; margin-bottom: 15px; font-size: 20px; }
            .footer p { color: #e2e8f0; margin-bottom: 8px; font-size: 14px; }
            .footer-bottom { border-top: 1px solid #4a5568; padding-top: 20px; font-size: 12px; color: #a0aec0; }
            .emoji { font-size: 20px; margin: 0 5px; }
            @media (max-width: 600px) {
                .email-container { margin: 10px; border-radius: 8px; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .brand-name { font-size: 24px; }
                .greeting { font-size: 20px; }
                .cta-button { display: block; text-align: center; margin: 20px 0; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://ibb.co/zkDbJdq" alt="StayEase Logo" class="logo">
                <div class="brand-name">StayEase</div>
                <div class="tagline">Your Home Away From Home</div>
            </div>
            
            <div class="content">
                <h2 class="greeting">Hi ${userName},</h2>
                ${content}
                ${ctaButton}
                ${propertyCard}
                <div class="message">
                    Thank you for choosing <span class="highlight">StayEase</span>. We're excited to be part of your journey! <span class="emoji">✨</span>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-content">
                    <h3>Stay Connected</h3>
                    <p>📧 support@stayease.com</p>
                    <p>📱 +1 (555) 123-4567</p>
                    <p>🌐 www.stayease.com</p>
                </div>
                <div class="footer-bottom">
                    <p>© 2024 StayEase. All rights reserved.</p>
                    <p>You're receiving this email because you have an account with StayEase.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};


module.exports = {
    createEmailTemplate
};
