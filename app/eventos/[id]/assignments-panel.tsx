"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ClientCombobox, type ComboOption } from "../../components/client-combobox";
import { StarRating } from "../../components/star-rating";
import { COLLABORATOR_ROLE_LABELS } from "../../lib/domain/labels";
import {
	assignCollaboratorAction,
	removeAssignmentAction,
	updateAssignmentRoleAction,
	type AssignmentState,
} from "../../lib/actions/assignments";

const ROLES = ["MASCOT_COSTUME", "ENTERTAINER", "LOGISTICS", "OTHER"] as const;

export type AssignmentRow = {
	id: string;
	collaboratorId: string;
	collaboratorName: string;
	roleInEvent: string | null;
	rating: number | null;
};

const initialState: AssignmentState = {};

function RoleSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
	return (
		<select name={name} defaultValue={defaultValue ?? ""} className='form-control'>
			<option value=''>Sin rol</option>
			{ROLES.map(role => (
				<option key={role} value={role}>
					{COLLABORATOR_ROLE_LABELS[role]}
				</option>
			))}
		</select>
	);
}

export function AssignmentsPanel({
	eventId,
	assignments,
	collaboratorOptions,
	isCompleted,
}: {
	eventId: string;
	assignments: AssignmentRow[];
	collaboratorOptions: ComboOption[];
	isCompleted: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(
		assignCollaboratorAction,
		initialState,
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!state.ok) return;
		const timer = window.setTimeout(() => {
			formRef.current?.reset();
			setOpen(false);
		}, 0);
		return () => window.clearTimeout(timer);
	}, [state.ok]);

	return (
		<section className='surface-card min-w-0 p-5 md:p-7'>
			<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Colaboradores asignados
				</h2>
				<button
					type='button'
					onClick={() => setOpen(v => !v)}
					aria-expanded={open}
					className='secondary-action flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
				>
					<Icon
						icon={
							open
								? "material-symbols:close-rounded"
								: "material-symbols:person-add-rounded"
						}
						className='h-5 w-5 shrink-0'
						aria-hidden='true'
					/>
					<span>{open ? "Cerrar" : "Asignar colaborador"}</span>
				</button>
			</div>

			{open ? (
				<form
					ref={formRef}
					action={formAction}
					className='mb-5 space-y-3 rounded-lg border border-[color:var(--border-color)] bg-muted p-4'
				>
					<input type='hidden' name='eventId' value={eventId} />
					<ClientCombobox
						name='collaboratorId'
						label='Colaborador'
						options={collaboratorOptions}
						placeholder='Buscar por nombre o rol…'
					/>
					<label className='block space-y-1 text-base font-bold text-[var(--text-primary)]'>
						<span>Rol en este evento</span>
						<RoleSelect name='roleInEvent' />
					</label>
					{state.error ? (
						<p className='text-sm font-bold text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<button
						type='submit'
						disabled={pending}
						className='primary-action min-h-11 w-full rounded-full px-4 py-2 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Asignando…" : "Asignar"}
					</button>
				</form>
			) : null}

			{assignments.length === 0 ? (
				<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
					Sin colaboradores asignados todavía. El sistema validará conflictos de
					fecha y hora al asignar.
				</p>
			) : (
				<ul className='list-none space-y-3 p-0'>
					{assignments.map(assignment => (
						<li
							key={assignment.id}
							className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
						>
							<div className='flex flex-wrap items-center justify-between gap-2'>
								<Link
									href={`/colaboradores/${assignment.collaboratorId}`}
									className='text-lg font-black text-[var(--text-primary)] underline-offset-2 hover:underline'
								>
									{assignment.collaboratorName}
								</Link>
								<StarRating
									value={assignment.rating}
									readOnly={!isCompleted}
									label='Calificación del colaborador'
									size='sm'
								/>
							</div>
							<div className='mt-3 flex flex-wrap items-end gap-2'>
								<form
									action={updateAssignmentRoleAction}
									className='flex items-end gap-2'
								>
									<input type='hidden' name='assignmentId' value={assignment.id} />
									<input type='hidden' name='eventId' value={eventId} />
									<label className='space-y-1 text-base font-bold text-[var(--text-primary)]'>
										<span>Rol en este evento</span>
										<RoleSelect
											name='roleInEvent'
											defaultValue={assignment.roleInEvent ?? ""}
										/>
									</label>
									<button
										type='submit'
										className='secondary-action min-h-11 rounded-full px-4 py-2 text-base font-black transition'
									>
										Guardar rol
									</button>
								</form>
								<form action={removeAssignmentAction}>
									<input type='hidden' name='assignmentId' value={assignment.id} />
									<input type='hidden' name='eventId' value={eventId} />
									<button
										type='submit'
										className='min-h-11 rounded-full px-4 py-2 text-base font-black text-[var(--error-color)] transition hover:bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)]'
									>
										Quitar
									</button>
								</form>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
