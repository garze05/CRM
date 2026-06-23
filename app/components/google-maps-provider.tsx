"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
	if (!googleMapsApiKey) return <>{children}</>;

	return (
		<APIProvider
			apiKey={googleMapsApiKey}
			libraries={["places"]}
			language='es-419'
			region='CR'
			authReferrerPolicy='origin'
			solutionChannel=''
		>
			{children}
		</APIProvider>
	);
}
