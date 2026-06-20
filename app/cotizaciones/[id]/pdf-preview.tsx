"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

type State =
	| { kind: "loading" }
	| { kind: "ready"; url: string }
	| { kind: "error"; message: string };

export function PdfPreview({ quoteId }: { quoteId: string }) {
	const [state, setState] = useState<State>({ kind: "loading" });

	useEffect(() => {
		let revoked = false;
		let objectUrl: string | null = null;

		async function load() {
			setState({ kind: "loading" });
			try {
				const res = await fetch(`/api/cotizaciones/${quoteId}/pdf`, {
					cache: "no-store",
				});
				if (!res.ok) {
					const message = await res.text();
					setState({
						kind: "error",
						message: message || "No se pudo cargar la vista previa.",
					});
					return;
				}
				const blob = await res.blob();
				if (revoked) return;
				objectUrl = URL.createObjectURL(blob);
				setState({ kind: "ready", url: objectUrl });
			} catch {
				setState({
					kind: "error",
					message: "No se pudo cargar la vista previa del documento.",
				});
			}
		}

		load();
		return () => {
			revoked = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [quoteId]);

	return (
		<section className='surface-card min-w-0 p-5 md:p-7'>
			<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Vista previa del documento
					</h2>
					<p className='mt-1 text-base text-[var(--text-secondary)]'>
						Generada bajo demanda por el motor de cotización.
					</p>
				</div>
				{state.kind === "ready" ? (
					<div className='flex items-center gap-2'>
						<a
							href={state.url}
							target='_blank'
							rel='noopener noreferrer'
							className='secondary-action flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
						>
							<Icon
								icon='material-symbols:open-in-new-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>Abrir</span>
						</a>
						<a
							href={state.url}
							download={`${quoteId}.pdf`}
							className='primary-action flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
						>
							<Icon
								icon='material-symbols:download-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>Descargar</span>
						</a>
					</div>
				) : null}
			</div>

			{state.kind === "loading" ? (
				<div className='grid h-96 place-items-center rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted'>
					<p className='flex items-center gap-2 text-lg font-bold text-[var(--text-secondary)]'>
						<Icon
							icon='material-symbols:progress-activity'
							className='h-6 w-6 animate-spin'
							aria-hidden='true'
						/>
						Generando vista previa…
					</p>
				</div>
			) : null}

			{state.kind === "error" ? (
				<div
					className='grid min-h-40 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] p-6 text-center'
					role='alert'
				>
					<p className='text-lg font-black text-[var(--warning-color)]'>{state.message}</p>
				</div>
			) : null}

			{state.kind === "ready" ? (
				<iframe
					src={state.url}
					title='Vista previa de la cotización'
					className='h-[640px] w-full rounded-lg border border-[color:var(--border-color)]'
				/>
			) : null}
		</section>
	);
}
