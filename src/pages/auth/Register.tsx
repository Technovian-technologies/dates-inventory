import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.terms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData.name, formData.email, formData.password);
      toast.success(response.message || "Registration successful! Please verify OTP.");
      // Navigate to OTP verification with email
      navigate("/auth/verify-otp", { state: { email: formData.email } });
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-sm shadow-primary/5 px-8 py-4 flex justify-between items-center">
        <div className="font-serif text-2xl font-bold text-primary">The Heritage Curator</div>
        <div className="flex items-center gap-6">
          <Link
            to="/auth/login"
            className="text-primary/60 hover:text-olive transition-colors font-serif text-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
        {/* Background Blur Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-gold/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-[100px]"></div>
        </div>

        {/* Registration Card */}
        <section className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden bg-card">
          {/* Left Side - Image */}
          <div className="hidden md:block md:w-1/2 relative min-h-[600px]">
            <img
              alt="Luxury dates"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9heGlgLRzIMrV5pRDO_VVPJ3LjIrcpVp_zjG0ReBJtL-6vegmh0wUZ16ZT3oXCINje5ujDQ65exTN2qILVNQM_VbY5QKLt2t4S-anZPtmG-T3laebeRi4v5xsJAdkab64eYVbg3bH3qRvExrTLpRj_fkwEY8EODX5lKipvjKwQ6JmuuhvVziD8sx7g-owQ9YUJHto0gNcwEZcvthcH9nRLc_SErV8c-UoXtsbWYKv82zprMg-hwnwaTq879yB7Qadcy546OcLlEDN"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-12 text-cream">
              <h2 className="font-serif text-3xl mb-4">The Art of Curation</h2>
              <p className="text-cream/80 leading-relaxed">
                Join an exclusive network of curators managing the world's finest heritage dates.
                Precision meets prestige in every transaction.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col bg-card">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-2 block">
                Registration
              </span>
              <h1 className="font-serif text-4xl text-primary mb-2">Join the Vault</h1>
              <p className="text-muted-foreground">
                Create your curator credentials to access the ledger.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cream-deep/40 border-0 border-b-2 border-transparent focus:border-gold focus:ring-0 rounded-md py-3 px-4 text-foreground transition-all placeholder:text-muted-foreground"
                    placeholder="e.g., Alexander Sterling"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-cream-deep/40 border-0 border-b-2 border-transparent focus:border-gold focus:ring-0 rounded-md py-3 px-4 text-foreground transition-all placeholder:text-muted-foreground"
                    placeholder="curator@heritage.com"
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-cream-deep/40 border-0 border-b-2 border-transparent focus:border-gold focus:ring-0 rounded-md py-3 px-4 text-foreground transition-all placeholder:text-muted-foreground"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-2 ml-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="w-full bg-cream-deep/40 border-0 border-b-2 border-transparent focus:border-gold focus:ring-0 rounded-md py-3 px-4 text-foreground transition-all placeholder:text-muted-foreground"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                    required
                  />
                </div>
                <div className="text-xs leading-5">
                  <label className="text-muted-foreground" htmlFor="terms">
                    I acknowledge that I have read and agree to the{" "}
                    <a
                      href="#"
                      className="text-gold underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and the Privacy Policy.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-cream font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Processing..." : "Finalize Registration"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Already an established curator?</p>
              <Link
                to="/auth/login"
                className="font-serif text-gold hover:text-primary transition-colors flex items-center gap-2"
              >
                Return to Secure Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center bg-background border-t border-border">
        <div className="font-serif text-lg font-bold text-primary mb-4 md:mb-0">
          The Heritage Curator
        </div>
        <div className="font-serif text-sm tracking-wide text-muted-foreground mb-4 md:mb-0">
          © 2024 The Heritage Curator. All Rights Reserved.
        </div>
        <div className="flex gap-8">
          <a
            href="#"
            className="font-serif text-sm tracking-wide text-muted-foreground hover:text-gold transition-all"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-serif text-sm tracking-wide text-muted-foreground hover:text-gold transition-all"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="font-serif text-sm tracking-wide text-muted-foreground hover:text-gold transition-all"
          >
            Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
}
