type ChangePermissionsEmailProps = {
  name: string | null,
  newPermission: string,
  organizationName: string
}

export function ChangePermissionsEmail({ name, newPermission, organizationName } : ChangePermissionsEmailProps) {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head />
      <body>
        <h1>Hello {name ?? ''}</h1>
        <p>
          This is a notification that your permission for the organization &quot;{organizationName}&quot; has been 
          updated to {newPermission}
        </p>
      </body>
    </html>
  );
}