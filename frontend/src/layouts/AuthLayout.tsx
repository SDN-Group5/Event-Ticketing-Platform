import TicketVibeNavbar from "../components/common/TicketVibeNavbar";
import TicketVibeFooter from "../components/common/TicketVibeFooter";

interface Props {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark text-white">
      <TicketVibeNavbar />
      <div className="flex-1">{children}</div>
      <TicketVibeFooter />
    </div>
  );
};

export default AuthLayout;
