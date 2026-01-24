import TicketVibeNavbar from "../components/common/TicketVibeNavbar";
import TicketVibeFooter from "../components/common/TicketVibeFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark text-white">
            <TicketVibeNavbar />
            <main className="flex flex-col">{children}</main>
            <TicketVibeFooter />
        </div>
    );
}

