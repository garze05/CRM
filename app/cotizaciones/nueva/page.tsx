import { Breadcrumb } from "../../components/breadcrumb";
import { listEventsForSelect } from "../../lib/server/events";
import { listPackages } from "../../lib/server/packages";
import { getSettings } from "../../lib/server/settings";
import { PackageQuoteForm } from "./package-quote-form";

export default async function NewQuotePage({
	searchParams,
}: {
	searchParams: Promise<{ evento?: string }>;
}) {
	const { evento } = await searchParams;
	const [events, packages, settings] = await Promise.all([
		listEventsForSelect(),
		listPackages(),
		getSettings(),
	]);
	const packageOptions = packages
		.filter(p => p.active)
		.map(p => ({
			id: p.id,
			name: p.name,
			description: p.description,
			durationHours: p.durationHours,
			basePrice: p.basePrice,
			itemCount: p.itemCount,
		}));

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<Breadcrumb
					items={[
						{ label: "Inicio", href: "/" },
						{ label: "Cotizaciones", href: "/cotizaciones" },
						{ label: "Nueva cotización" },
					]}
				/>
				<h1 className='page-heading'>Nueva cotización</h1>
				<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
					Ofrecé 1–3 paquetes como opciones y marcá el popular. El precio de cada
					uno se calcula con el recargo del tipo de cliente.
				</p>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<PackageQuoteForm
					events={events}
					packages={packageOptions}
					selectedEventId={evento}
					transportBasePrice={Number(settings.transportBasePrice)}
				/>
			</div>
		</>
	);
}
