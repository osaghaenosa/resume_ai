import Pricing from "../components/Pricing";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
  const navigate = useNavigate();

  const handleNavigateSignup = () => {
    navigate("/signup");
  };

  const handleStartUpgrade = () => {
    navigate("/checkout"); 
    // or "/upgrade" or your Flutterwave payment route
  };

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-20">
      <Pricing
        onNavigateSignup={handleNavigateSignup}
        onStartUpgrade={handleStartUpgrade}
      />
    </main>
  );
}
