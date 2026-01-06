interface PortalLoginEmailProps {
    clientName: string
    freelancerName: string
    loginUrl: string
    expiresIn: string
}

export function portalLoginEmailHtml({
    clientName,
    freelancerName,
    loginUrl,
    expiresIn,
}: PortalLoginEmailProps): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Client Portal Access</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${clientName},</p>
    
    <p style="margin-bottom: 20px;">
      You requested access to your client portal with <strong>${freelancerName}</strong>.
    </p>
    
    <p style="margin-bottom: 25px;">
      Click the button below to securely access your portal:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" 
         style="display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Access Your Portal
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
      This link expires in ${expiresIn}. If you didn't request this, you can safely ignore this email.
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="color: #3B82F6; word-break: break-all;">${loginUrl}</span>
    </p>
  </div>
</body>
</html>
  `.trim()
}

export function portalLoginEmailText({
    clientName,
    freelancerName,
    loginUrl,
    expiresIn,
}: PortalLoginEmailProps): string {
    return `
Hi ${clientName},

You requested access to your client portal with ${freelancerName}.

Click here to access your portal: ${loginUrl}

This link expires in ${expiresIn}. If you didn't request this, you can safely ignore this email.
  `.trim()
}
