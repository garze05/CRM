import { Breadcrumb } from "../../../components/breadcrumb";
import { listEventsForSelect } from "../../../lib/server/events";
import { NewQuoteForm } from "../new-quote-form";

/**
 * Ruta Custom (excepción, no el flujo por defecto): cotización armada con ítems
 * sueltos contra la Quotation API. Se mantiene apartada a propósito — el flujo
 * recomendado es la cotización por paquetes en /cotizaciones/nueva.
 */
export default async function CustomQuotePage({
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
						{ label: "Nueva cotización", href: "/cotizaciones/nueva" },
						{ label: "Personalizada" },
					]}
				/>
				<h1 className='page-heading'>Cotización personalizada</h1>
				<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
					Caso excepcional: armá la cotización con ítems sueltos. El flujo
					recomendado es ofrecer paquetes preconfigurados.
				</p>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<NewQuoteForm events={events} selectedEventId={evento} />
			</div>
		</>
	);
}
