import DockMenu from "@/components/panel/caree/DocMenu";
import Header from "@/components/panel/caree/header";

export default function CareeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-[90vh] max-h-[90vh] bg-background">
			<Header />
			<main className="mx-auto  max-w-6xl px-4 py-8">
				{children}
			</main>
            <DockMenu />
			
		</div>
	);
}
