type RemoveUserEmailProps = {
  name: string | null,
  organizationName: string,
  organizationOwnerEmail: string
}

export function RemoveUserEmail({ name, organizationName, organizationOwnerEmail } : RemoveUserEmailProps) {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head />
      <body>
        <h1>Hello {name ?? ''}</h1>
        <p>This is a notification that you have been removed from {organizationName}</p>
        <p>If you feel this is an error please contact your organization owner at {organizationOwnerEmail}</p>
      </body>
    </html>
  );
}