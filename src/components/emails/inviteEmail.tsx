import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

type inviteEmailProps = {
	name: string,
	expiresIn: Date,
	makeAdmin?: boolean,
	organizationName: string,
	link: string,
}

export function InviteEmail({ expiresIn, name, makeAdmin, organizationName, link } : inviteEmailProps) {
	return (
		<html>
			{/* eslint-disable-next-line @next/next/no-head-element */}
			<head/>
			<body>
				<div>
					<h1>Hello {name}</h1>
					<p>
						You have been invited to join {organizationName} {makeAdmin && "as an admin"}. Click the link below to get 
						started
					</p>
					<a href={link}>Click here: {link}</a>
					<p>This link expires in {dayjs(expiresIn).fromNow()}</p>
				</div>
			</body>
		</html>
	);
}