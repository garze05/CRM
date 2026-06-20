"use client";

import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";

/**
 * Conmutador de tema claro/oscuro. Cumple la regla de iconos con etiqueta
 * visible (DESIGN.md §6.3): el botón muestra texto, no solo el icono.
 */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Evita desajuste de hidratación: el tema real solo se conoce en cliente.
	// Patrón de montaje SSR de next-themes; el setState único en montaje es intencional.
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	const isDark = mounted && resolvedTheme === "dark";
	const nextLabel = isDark ? "Tema claro" : "Tema oscuro";

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={`Cambiar a ${nextLabel.toLowerCase()}`}
		>
			<Icon
				icon={
					isDark
						? "material-symbols:light-mode-rounded"
						: "material-symbols:dark-mode-rounded"
				}
				className="h-5 w-5"
				aria-hidden="true"
			/>
			<span>{nextLabel}</span>
		</Button>
	);
}
