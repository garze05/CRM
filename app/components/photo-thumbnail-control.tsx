"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { useRef, useState, type ChangeEvent } from "react";
import type { CatalogCategory } from "../lib/domain/catalog";
import { InitialsThumbnail, InventoryThumbnail } from "./entity-thumbnail";

addCollection(materialSymbolsIcons);

type PhotoThumbnailControlProps =
	| {
			kind: "client";
			name: string;
			initials: string;
	  }
	| {
			kind: "collaborator";
			name: string;
			initials: string;
	  }
	| {
			kind: "inventory";
			name: string;
			category: CatalogCategory;
	  };

export function PhotoThumbnailControl(props: PhotoThumbnailControlProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				setPhotoUrl(reader.result);
				setIsMenuOpen(false);
			}
		};
		reader.readAsDataURL(file);
	}

	function openFilePicker() {
		inputRef.current?.click();
	}

	function removePhoto() {
		setPhotoUrl(null);
		setIsMenuOpen(false);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}

	const isInventory = props.kind === "inventory";
	const boxClass = isInventory ? "h-44 w-full rounded-lg" : "h-28 w-28 rounded-full";
	const defaultThumbnail =
		props.kind === "client" || props.kind === "collaborator" ? (
			<InitialsThumbnail initials={props.initials} size='profile' />
		) : (
			<InventoryThumbnail category={props.category} size='lg' />
		);

	return (
		<div className={`relative max-w-full ${isInventory ? "block w-full" : "inline-block"}`}>
			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				onChange={handleFileChange}
				className='hidden'
			/>

			<button
				type='button'
				onClick={() => setIsMenuOpen(current => !current)}
				className={`group relative block overflow-hidden ${boxClass} text-left`}
				aria-haspopup='menu'
				aria-expanded={isMenuOpen}
			>
				{photoUrl ? (
					<span
						className={`block h-full w-full bg-cover bg-center ${boxClass}`}
						role='img'
						aria-label={`Foto de ${props.name}`}
						style={{ backgroundImage: `url(${photoUrl})` }}
					/>
				) : (
					defaultThumbnail
				)}
				<span className='absolute inset-0 grid place-items-center bg-black/0 text-background opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100'>
					<span className='grid place-items-center rounded-lg bg-foreground px-3 py-3 shadow-[var(--crisp-shadow)]'>
						<Icon
							icon='material-symbols:photo-camera-rounded'
							className='h-7 w-7'
							aria-hidden='true'
						/>
						<span className='mt-1 text-xs font-black'>Foto</span>
					</span>
				</span>
			</button>

			{isMenuOpen ? (
				<div
					className={`absolute z-50 mt-2 w-64 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] py-2 shadow-[var(--soft-shadow)] ${
						isInventory ? "left-0" : "left-1/2 -translate-x-1/2"
					}`}
					role='menu'
				>
					<button
						type='button'
						onClick={openFilePicker}
						className='flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-lg font-bold text-[var(--text-primary)] transition hover:bg-muted'
						role='menuitem'
					>
						<Icon
							icon='material-symbols:add-photo-alternate-rounded'
							className='h-6 w-6 shrink-0 text-[var(--primary-color)]'
							aria-hidden='true'
						/>
						<span>{photoUrl ? "Cambiar foto" : "Añadir foto"}</span>
					</button>
					{photoUrl ? (
						<button
							type='button'
							onClick={removePhoto}
							className='flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-lg font-bold text-[var(--text-primary)] transition hover:bg-muted'
							role='menuitem'
						>
							<Icon
								icon='material-symbols:delete-outline-rounded'
								className='h-6 w-6 shrink-0 text-[var(--primary-color)]'
								aria-hidden='true'
							/>
							<span>Remover</span>
						</button>
					) : null}
				</div>
			) : null}
		</div>
	);
}
