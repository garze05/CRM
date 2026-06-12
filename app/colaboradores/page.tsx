import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { CollaboratorsTable } from "./collaborators-table";
import { collaborators } from "../lib/mock-data";

export default function CollaboratorsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Colaboradores" },
				]}
				title='Colaboradores'
				description='Personas disponibles para botargas, animación, logística y apoyo en eventos.'
				actions={
					<Link
						href='/colaboradores/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo colaborador' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<CollaboratorsTable rows={collaborators} />
				</SectionCard>
			</div>
		</>
	);
}
