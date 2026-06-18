"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";

addCollection(materialSymbolsIcons);

const DURATION_MS = 10_000;

export type ToastType = "success" | "trash" | "error" | "info";

export type ToastData = {
	message: string;
	type?: ToastType;
	onUndo?: () => Promise<void> | void;
};

type ToastItem = ToastData & { id: string };

type ToastContextValue = {
	addToast: (toast: ToastData) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastCard({
	toast,
	onRemove,
}: {
	toast: ToastItem;
	onRemove: (id: string) => void;
}) {
	const [undoing, setUndoing] = useState(false);

	const isTrash = toast.type === "trash";
	const isError = toast.type === "error";
	const isSuccess = !isTrash && !isError;

	const icon = isTrash
		? "material-symbols:delete-outline-rounded"
		: isError
			? "material-symbols:error-outline-rounded"
			: "material-symbols:check-circle-outline-rounded";

	const iconColorClass = isTrash || isError ? "text-[var(--error-color)]" : "text-[var(--success-color)]";
	const iconBgClass = isTrash || isError ? "bg-[#ffe0e3]" : "bg-[#e0f5f4]";
	const timerColorClass = isTrash || isError ? "bg-[var(--error-color)]" : isSuccess ? "bg-[var(--success-color)]" : "bg-[var(--primary-color)]";

	async function handleUndo() {
		if (!toast.onUndo || undoing) return;
		setUndoing(true);
		try {
			await toast.onUndo();
		} finally {
			onRemove(toast.id);
		}
	}

	return (
		<div
			className='toast-enter pointer-events-auto w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] shadow-[var(--soft-shadow)]'
			role='alert'
			aria-live='polite'
		>
			<div className='flex items-start gap-3 p-4'>
				<div
					className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBgClass} ${iconColorClass}`}
				>
					<Icon icon={icon} className='h-5 w-5' aria-hidden='true' />
				</div>
				<div className='min-w-0 flex-1'>
					<p className='text-base font-bold leading-snug text-[var(--text-primary)]'>
						{toast.message}
					</p>
					{toast.onUndo ? (
						<button
							type='button'
							onClick={handleUndo}
							disabled={undoing}
							className='mt-1.5 text-sm font-black text-[var(--primary-color)] hover:underline disabled:opacity-60'
						>
							{undoing ? "Deshaciendo…" : "Deshacer"}
						</button>
					) : null}
				</div>
				<button
					type='button'
					onClick={() => onRemove(toast.id)}
					className='shrink-0 rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
					aria-label='Cerrar'
				>
					<Icon icon='material-symbols:close-rounded' className='h-4 w-4' aria-hidden='true' />
				</button>
			</div>
			<div className='h-1 w-full bg-[var(--border-color)]'>
				<div
					className={`toast-timer h-1 ${timerColorClass}`}
					style={{ animationDuration: `${DURATION_MS}ms` }}
				/>
			</div>
		</div>
	);
}

function Toaster({
	toasts,
	onRemove,
}: {
	toasts: ToastItem[];
	onRemove: (id: string) => void;
}) {
	if (toasts.length === 0) return null;
	return (
		<div className='pointer-events-none fixed right-4 top-4 z-[200] flex w-80 flex-col gap-2'>
			{toasts.map(t => (
				<ToastCard key={t.id} toast={t} onRemove={onRemove} />
			))}
		</div>
	);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(t => t.id !== id));
		const t = timers.current.get(id);
		if (t) {
			clearTimeout(t);
			timers.current.delete(id);
		}
	}, []);

	const addToast = useCallback(
		(toast: ToastData) => {
			const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			setToasts(prev => [...prev, { ...toast, id }]);
			timers.current.set(id, setTimeout(() => removeToast(id), DURATION_MS));
		},
		[removeToast],
	);

	return (
		<ToastContext.Provider value={{ addToast }}>
			{children}
			<Toaster toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used inside ToastProvider");
	return ctx;
}
