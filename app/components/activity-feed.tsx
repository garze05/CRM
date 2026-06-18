"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dismissActivityEntry } from "../lib/actions/activity";

addCollection(materialSymbolsIcons);

export type ActivityEntry = {
	id: string;
	actor: string;
	description: string;
	occurredAt: string;
	kind: "Cambios" | "Interacciones" | "Papelera" | "Tareas";
	source: "audit" | "interaction";
};

const PAGE_SIZE = 10;
const FILTERS = ["Todo", "Cambios", "Interacciones", "Papelera", "Tareas"] as const;
const SWIPE_THRESHOLD = 88;
const MAX_SWIPE = 104;

function formatActivityDate(value: string) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Costa_Rica",
	}).format(new Date(value));
}

function SwipeActivityItem({ entry }: { entry: ActivityEntry }) {
	const [swipeX, setSwipeX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [, startTransition] = useTransition();
	const startXRef = useRef<number | null>(null);
	const swipeXRef = useRef(0);
	const router = useRouter();

	function startSwipe(clientX: number) {
		if (dismissed) return;
		startXRef.current = clientX;
		setIsDragging(true);
	}

	function updateSwipe(clientX: number) {
		if (startXRef.current === null || dismissed) return;
		const delta = Math.max(0, startXRef.current - clientX);
		const next = Math.min(MAX_SWIPE, delta);
		swipeXRef.current = next;
		setSwipeX(next);
	}

	function endSwipe() {
		if (startXRef.current === null) return;
		startXRef.current = null;
		setIsDragging(false);
		if (swipeXRef.current >= SWIPE_THRESHOLD) {
			swipeXRef.current = 0;
			setDismissed(true);
			startTransition(async () => {
				await dismissActivityEntry(entry.id, entry.source);
				router.refresh();
			});
			return;
		}
		swipeXRef.current = 0;
		setSwipeX(0);
	}

	if (dismissed) return null;

	return (
		<li className='relative overflow-hidden rounded-lg border border-[color:var(--border-color)] bg-[#fff4f0]'>
			<div className='absolute inset-y-0 right-0 flex w-28 items-center justify-center gap-1.5 text-xs font-black text-[var(--error-color)]'>
				<Icon
					icon='material-symbols:delete-outline-rounded'
					className='h-4 w-4 shrink-0'
					aria-hidden='true'
				/>
				<span>Eliminar</span>
			</div>
			<div
				onPointerDown={event => {
					event.currentTarget.setPointerCapture(event.pointerId);
					startSwipe(event.clientX);
				}}
				onPointerMove={event => updateSwipe(event.clientX)}
				onPointerUp={endSwipe}
				onPointerCancel={endSwipe}
				style={{ transform: `translateX(-${swipeX}px)` }}
				className={`relative cursor-grab rounded-lg bg-[var(--surface-color)] px-3 py-2 active:cursor-grabbing ${
					isDragging ? "" : "transition-transform duration-200"
				}`}
				aria-label='Deslizar hacia la izquierda para eliminar de la lista'
			>
				<div className='flex flex-wrap items-center gap-2 text-xs font-black text-[var(--text-muted)]'>
					<span>{formatActivityDate(entry.occurredAt)}</span>
					<span>·</span>
					<span>{entry.kind}</span>
					<span className='ml-auto inline-flex items-center gap-1 text-[var(--primary-color)]'>
						<Icon
							icon='material-symbols:swipe-left-rounded'
							className='h-4 w-4'
							aria-hidden='true'
						/>
						<span>Deslizar para borrar</span>
					</span>
				</div>
				<p className='mt-1 text-sm font-semibold leading-5 text-[var(--text-secondary)]'>
					<span className='font-black text-[var(--text-primary)]'>
						{entry.actor}
					</span>{" "}
					{entry.description}
				</p>
			</div>
		</li>
	);
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todo");
	const [page, setPage] = useState(0);

	const filtered = useMemo(
		() =>
			filter === "Todo"
				? entries
				: entries.filter(entry => entry.kind === filter),
		[entries, filter],
	);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const pageEntries = filtered.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE,
	);

	function changeFilter(next: (typeof FILTERS)[number]) {
		setFilter(next);
		setPage(0);
	}

	return (
		<div className='flex h-80 min-h-0 flex-col'>
			<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
				<div className='flex flex-wrap gap-1.5'>
					{FILTERS.map(item => (
						<button
							key={item}
							type='button'
							onClick={() => changeFilter(item)}
							className={`min-h-8 rounded-lg border px-3 text-xs font-black transition ${
								filter === item
									? "border-transparent bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "border-[color:var(--border-color)] bg-[var(--surface-color)] text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							{item}
						</button>
					))}
				</div>
				<p className='text-xs font-bold text-[var(--text-muted)]'>
					{filtered.length} registros
				</p>
			</div>

			{pageEntries.length === 0 ? (
				<p className='grid flex-1 place-items-center rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] text-sm font-bold text-[var(--text-secondary)]'>
					Sin actividad registrada.
				</p>
			) : (
				<ol className='min-h-0 flex-1 list-none space-y-2 overflow-y-auto pr-1'>
					{pageEntries.map(entry => (
						<SwipeActivityItem key={entry.id} entry={entry} />
					))}
				</ol>
			)}

			<div className='mt-3 flex items-center justify-between gap-3 border-t border-[color:var(--border-color)] pt-3'>
				<button
					type='button'
					onClick={() => setPage(value => Math.max(0, value - 1))}
					disabled={currentPage === 0}
					className='secondary-action min-h-8 rounded-lg px-3 text-xs font-black transition disabled:opacity-45'
				>
					Anterior
				</button>
				<span className='text-xs font-black text-[var(--text-muted)]'>
					{currentPage + 1} / {totalPages}
				</span>
				<button
					type='button'
					onClick={() => setPage(value => Math.min(totalPages - 1, value + 1))}
					disabled={currentPage >= totalPages - 1}
					className='secondary-action min-h-8 rounded-lg px-3 text-xs font-black transition disabled:opacity-45'
				>
					Siguiente
				</button>
			</div>
		</div>
	);
}
