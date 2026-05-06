import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./context/ThemeContext";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthenticatedLayout>
          <AppRoutes />
        </AuthenticatedLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
