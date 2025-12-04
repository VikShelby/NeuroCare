import DockMenu from "@/components/panel/caree/DocMenu";
import Header from "@/components/panel/caree/header";

export default function CareeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen ">
			<Header />
			<main className="mx-auto max-w-3xl md:px-4 md:h-auto h-[75hv] md:pb-32 pt-6">
				{children}
			</main>
			<DockMenu />
		</div>
	);
}
