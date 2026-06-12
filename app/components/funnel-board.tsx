import Link from "next/link";

const STAGE_COLORS: Record<string, string> = {
	PROSPECTO: "var(--text-muted)",
	CONTACTADO: "var(--info-color)",
	COTIZADO: "var(--tertiary-color)",
	RESERVADO: "var(--accent-color)",
	CONFIRMADO: "var(--secondary-color)",
	REALIZADO: "var(--primary-color)",
	RECURRENTE: "var(--primary-active)",
	CANCELADO: "var(--error-color)",
};

const STAGE_LABELS: Record<string, string> = {
	PROSPECTO: "Prospecto",
	CONTACTADO: "Contactado",
	COTIZADO: "Cotizado",
	RESERVADO: "Reservado",
	CONFIRMADO: "Confirmado",
	REALIZADO: "Realizado",
	RECURRENTE: "Recurrente",
	CANCELADO: "Cancelado",
};

/**
 * Embudo de ventas horizontal, clicable: cada etapa filtra /eventos?etapa=X.
 * Se usa en el dashboard; la misma pieza servirá como filtro activo en /eventos.
 */
export function FunnelBoard({
	stages,
}: {
	stages: { label: string; total: number }[];
}) {
	return (
		<ol className='grid list-none gap-3 p-0 sm:grid-cols-3 xl:grid-cols-6'>
			{stages.map(stage => (
				<li key={stage.label}>
					<Link
						href={`/eventos?etapa=${stage.label}`}
						className='block rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 text-center transition hover:border-[color:var(--accent-color)] hover:shadow-[var(--crisp-shadow)]'
					>
						<span
							className='mx-auto mb-3 block h-2 w-16 rounded-full'
							style={{ backgroundColor: STAGE_COLORS[stage.label] }}
							aria-hidden='true'
						/>
						<span className='block text-4xl font-black leading-none text-[var(--primary-color)]'>
							{stage.total}
						</span>
						<span className='mt-2 block text-base font-black text-[var(--text-secondary)]'>
							{STAGE_LABELS[stage.label] ?? stage.label}
						</span>
					</Link>
				</li>
			))}
		</ol>
	);
}
