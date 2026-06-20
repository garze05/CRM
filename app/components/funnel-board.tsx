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
	PROSPECT: "var(--text-muted)",
	CONTACTED: "var(--info-color)",
	QUOTED: "var(--tertiary-color)",
	RESERVED: "var(--accent-color)",
	CONFIRMED: "var(--secondary-color)",
	COMPLETED: "var(--primary-color)",
	CANCELED: "var(--error-color)",
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
	PROSPECT: "Prospecto",
	CONTACTED: "Contactado",
	QUOTED: "Cotizado",
	RESERVED: "Reservado",
	CONFIRMED: "Confirmado",
	COMPLETED: "Realizado",
	CANCELED: "Cancelado",
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
		<ol className='grid list-none gap-3 p-0 sm:grid-cols-3 xl:grid-cols-7'>
			{stages.map(stage => (
				<li key={stage.label}>
					<Link
						href={`/eventos?etapa=${stage.label}`}
						className='block rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-3 text-center transition hover:border-[color:var(--accent-color)] hover:shadow-[var(--crisp-shadow)]'
					>
						<span
							className='mx-auto mb-2 block h-1.5 w-14 rounded-full'
							style={{ backgroundColor: STAGE_COLORS[stage.label] }}
							aria-hidden='true'
						/>
						<span className='block text-4xl font-black leading-none text-[var(--primary-color)]'>
							{stage.total}
						</span>
						<span className='mt-1.5 block text-sm font-black text-[var(--text-secondary)]'>
							{STAGE_LABELS[stage.label] ?? stage.label}
						</span>
					</Link>
				</li>
			))}
		</ol>
	);
}
