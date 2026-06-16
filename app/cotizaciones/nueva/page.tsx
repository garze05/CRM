import { Breadcrumb } from "../../components/breadcrumb";
import { listEventsForSelect } from "../../lib/server/events";
import { NewQuoteForm } from "./new-quote-form";

export default async function NewQuotePage({
	searchParams,
}: {
	searchParams: Promise<{ evento?: string }>;
}) {
	const { evento } = await searchParams;
	const events = await listEventsForSelect();

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
					Generá una cotización para un evento: el motor calcula precios,
					descuentos y transporte, y asigna el código del documento.
				</p>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<NewQuoteForm events={events} selectedEventId={evento} />
			</div>
		</>
	);
}
