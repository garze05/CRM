"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
	APILoadingStatus,
	Map,
	Marker,
	useApiLoadingStatus,
	useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { useToast } from "./toast";

addCollection(materialSymbolsIcons);

type Prediction = google.maps.places.PlacePrediction;

type AddressPickerProps = {
	label: string;
	addressName: string;
	placeNameName?: string;
	latName: string;
	lngName: string;
	defaultAddress?: string;
	defaultPlaceName?: string;
	defaultLat?: number | null;
	defaultLng?: number | null;
	placeholder?: string;
	hint?: string;
	className?: string;
};

function coordinateValue(value: number | null): string {
	return value === null || !Number.isFinite(value) ? "" : String(value);
}

function parseCoordinate(value: number | null | undefined): number | null {
	if (value === null || value === undefined) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

function formatPlaceAddress(placeName: string, address: string): string {
	const cleanName = placeName.trim();
	const cleanAddress = address.trim();
	if (!cleanName) return cleanAddress;
	if (!cleanAddress) return cleanName;
	if (cleanAddress.toLowerCase().startsWith(cleanName.toLowerCase())) {
		return cleanAddress;
	}
	return `${cleanName}. ${cleanAddress}`;
}

export function AddressPicker({
	label,
	addressName,
	placeNameName,
	latName,
	lngName,
	defaultAddress = "",
	defaultPlaceName = "",
	defaultLat,
	defaultLng,
	placeholder = "Buscá la dirección en Google Maps",
	hint,
	className,
}: AddressPickerProps) {
	const listId = useId();
	const { addToast } = useToast();
	const places = useMapsLibrary("places");
	const loadingStatus = useApiLoadingStatus();
	const sessionTokenRef =
		useRef<google.maps.places.AutocompleteSessionToken | null>(null);
	const [address, setAddress] = useState(defaultAddress);
	const [placeName, setPlaceName] = useState(defaultPlaceName);
	const [displayValue, setDisplayValue] = useState(
		placeNameName
			? formatPlaceAddress(defaultPlaceName, defaultAddress)
			: defaultAddress,
	);
	const [selectedDisplayValue, setSelectedDisplayValue] =
		useState(displayValue);
	const [lat, setLat] = useState(parseCoordinate(defaultLat));
	const [lng, setLng] = useState(parseCoordinate(defaultLng));
	const [suggestions, setSuggestions] = useState<Prediction[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [copiedAddress, setCopiedAddress] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const mapsReady = loadingStatus === APILoadingStatus.LOADED && places;
	const hasCoordinates = lat !== null && lng !== null;
	const hasSelectedLocation = Boolean(selectedDisplayValue) && hasCoordinates;
	const mapCenter = useMemo(
		() => (hasCoordinates ? { lat, lng } : null),
		[hasCoordinates, lat, lng],
	);

	useEffect(() => {
		const query = displayValue.trim();

		if (!mapsReady || query.length < 3 || query === selectedDisplayValue) {
			return;
		}

		const timeout = window.setTimeout(async () => {
			try {
				setIsSearching(true);
				if (!sessionTokenRef.current) {
					sessionTokenRef.current = new places.AutocompleteSessionToken();
				}
				const response =
					await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
						input: query,
						language: "es-419",
						region: "cr",
						includedRegionCodes: ["CR"],
						sessionToken: sessionTokenRef.current,
					});
				setSuggestions(
					response.suggestions
						.map(suggestion => suggestion.placePrediction)
						.filter(prediction => prediction !== null),
				);
				setStatusMessage(
					response.suggestions.length > 0
						? "Seleccioná una dirección de la lista."
						: "No encontramos sugerencias. Podés escribir la dirección manualmente.",
				);
			} catch (error) {
				console.error("Address autocomplete failed", error);
				setSuggestions([]);
				setErrorMessage(
					"No pudimos buscar sugerencias. Podés escribir la dirección manualmente.",
				);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [displayValue, mapsReady, places, selectedDisplayValue]);

	function handleAddressChange(nextDisplayValue: string) {
		setDisplayValue(nextDisplayValue);
		setAddress(nextDisplayValue);
		if (placeNameName) setPlaceName("");
		setErrorMessage("");
		if (nextDisplayValue !== selectedDisplayValue) {
			setLat(null);
			setLng(null);
			setSelectedDisplayValue("");
			setStatusMessage("");
		}
		if (nextDisplayValue.trim().length < 3) {
			setSuggestions([]);
			setIsSearching(false);
		}
	}

	async function selectPrediction(prediction: Prediction) {
		setIsSelecting(true);
		setErrorMessage("");
		try {
			const place = prediction.toPlace();
			await place.fetchFields({
				fields: ["formattedAddress", "location", "displayName"],
			});
			const location = place.location;
			if (!location) {
				setErrorMessage(
					"Google no devolvió coordenadas para esa dirección. Probá otra sugerencia.",
				);
				return;
			}

			const nextAddress = place.formattedAddress || prediction.text.text;
			const nextPlaceName =
				place.displayName || prediction.mainText?.text || "";
			const nextDisplayValue = placeNameName
				? formatPlaceAddress(nextPlaceName, nextAddress)
				: nextAddress;
			setAddress(nextAddress);
			setPlaceName(nextPlaceName);
			setDisplayValue(nextDisplayValue);
			setSelectedDisplayValue(nextDisplayValue);
			setLat(location.lat());
			setLng(location.lng());
			setSuggestions([]);
			setStatusMessage(
				"Se encontró la dirección y se guardaron las coordenadas.",
			);
			sessionTokenRef.current = null;
		} catch (error) {
			console.error("Address selection failed", error);
			setErrorMessage(
				"No pudimos seleccionar esa dirección. Intentá de nuevo.",
			);
		} finally {
			setIsSelecting(false);
		}
	}

	async function copyGoogleMapsLink() {
		if (!mapCenter) return;
		const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}`;
		try {
			await navigator.clipboard.writeText(googleMapsLink);
			setCopiedAddress(true);
			addToast({
				message: "Enlace de Google Maps copiado",
				type: "success",
			});
			window.setTimeout(() => setCopiedAddress(false), 2200);
		} catch (error) {
			console.error("Copy Google Maps link failed", error);
			addToast({
				message: "No pudimos copiar el enlace de Google Maps.",
				type: "error",
			});
		}
	}

	return (
		<div className={className}>
			<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
				<span>{label}</span>
				<input
					name={placeNameName ? undefined : addressName}
					value={displayValue}
					onChange={event => handleAddressChange(event.target.value)}
					className='form-control'
					placeholder={placeholder}
					autoComplete='street-address'
					role='combobox'
					aria-autocomplete='list'
					aria-controls={suggestions.length > 0 ? listId : undefined}
					aria-expanded={suggestions.length > 0}
				/>
			</label>
			{placeNameName ? (
				<>
					<input type='hidden' name={addressName} value={address} />
					<input type='hidden' name={placeNameName} value={placeName} />
				</>
			) : null}
			<input type='hidden' name={latName} value={coordinateValue(lat)} />
			<input type='hidden' name={lngName} value={coordinateValue(lng)} />

			{hint && !hasSelectedLocation ? (
				<span className='mt-2 block text-base font-semibold text-[var(--text-secondary)]'>
					{hint}
				</span>
			) : null}

			{loadingStatus === APILoadingStatus.NOT_LOADED ? (
				<span className='mt-2 block text-base font-semibold text-[var(--text-secondary)]'>
					La búsqueda de Google Maps se activará cuando configurés la llave del
					navegador.
				</span>
			) : null}

			{isSearching || isSelecting ? (
				<span className='mt-2 block text-base font-bold text-[var(--text-secondary)]'>
					{isSelecting ? "Seleccionando dirección…" : "Buscando direcciones…"}
				</span>
			) : null}

			{errorMessage ? (
				<span className='mt-2 block rounded-lg bg-[color-mix(in_srgb,var(--error-color)_12%,transparent)] px-3 py-2 text-base font-bold text-[var(--error-color)]'>
					{errorMessage}
				</span>
			) : null}

			{statusMessage && !errorMessage ? (
				<span
					className={`mt-2 block text-base font-semibold ${
						hasSelectedLocation
							? "text-[var(--success-color)]"
							: "text-[var(--text-secondary)]"
					}`}
				>
					{statusMessage}
				</span>
			) : null}

			{suggestions.length > 0 ? (
				<div
					id={listId}
					role='listbox'
					className='mt-3 overflow-hidden rounded-lg border border-border bg-popover shadow-[var(--soft-shadow)]'
				>
					{suggestions.map(prediction => (
						<button
							key={prediction.placeId}
							type='button'
							role='option'
							aria-selected='false'
							onClick={() => void selectPrediction(prediction)}
							className='flex min-h-12 w-full flex-col items-start justify-center gap-0.5 border-b border-border px-4 py-3 text-left text-base font-bold text-popover-foreground transition last:border-b-0 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
						>
							<span>{prediction.mainText?.text ?? prediction.text.text}</span>
							{prediction.secondaryText ? (
								<span className='text-sm font-semibold text-[var(--text-secondary)]'>
									{prediction.secondaryText.text}
								</span>
							) : null}
						</button>
					))}
				</div>
			) : null}

			{mapCenter && loadingStatus === APILoadingStatus.LOADED ? (
				<div className='mt-4 space-y-3'>
					<div className='h-56 overflow-hidden rounded-lg border border-border md:h-64'>
						<Map
							center={mapCenter}
							defaultCenter={mapCenter}
							defaultZoom={15}
							gestureHandling='cooperative'
							disableDefaultUI
							zoomControl
						>
							<Marker position={mapCenter} />
						</Map>
					</div>
					<div className='flex justify-end'>
						<button
							type='button'
							onClick={() => void copyGoogleMapsLink()}
							className='inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-popover px-4 py-2 text-sm font-black text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
						>
							<Icon
								icon={
									copiedAddress
										? "material-symbols:check-rounded"
										: "material-symbols:content-copy-outline-rounded"
								}
								className='h-4 w-4 shrink-0'
								aria-hidden='true'
							/>
							<span>
								{copiedAddress ? "Enlace copiado" : "Copiar enlace Maps"}
							</span>
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
