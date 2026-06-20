"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function CopyableMessage({
	label,
	message,
}: {
	label: string;
	message: string;
}) {
	const [copied, setCopied] = useState(false);

	async function copyMessage() {
		await navigator.clipboard.writeText(message);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	}

	return (
		<div className='space-y-2'>
			<label className='block text-base font-black text-foreground'>
				{label}
			</label>
			<textarea
				readOnly
				value={message}
				className='form-control min-h-44 resize-none py-3 leading-7'
			/>
			<Button type='button' variant='secondary' onClick={copyMessage}>
				{copied ? "Mensaje copiado" : "Copiar mensaje"}
			</Button>
		</div>
	);
}
