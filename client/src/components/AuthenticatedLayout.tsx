import { type ReactNode } from "react";
import Navbar from "./Navbar";


type Props = {
  children: ReactNode;
};

export default function AuthenticatedLayout({ children }: Props) {
  // Render Navbar globally and simply render children below it.
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  );
}
