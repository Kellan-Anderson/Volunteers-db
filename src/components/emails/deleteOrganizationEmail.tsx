type OrganizationDeletedEmailProps = {
  organizationName: string,
}

export function OrganizationDeletedEmail({ organizationName } : OrganizationDeletedEmailProps) {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head />
      <body>
        <h3>Hello,</h3>
        <p>
          This is a notification that {organizationName} volunteers database has been removed and any data associated 
          with it has been erased. If you feel like you are receiving this email by mistake, please contact your system 
          admin
        </p>
        <p>Thank you and have a great day</p>
      </body>
    </html>
  );
}