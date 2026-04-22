import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error("Email not found. Please register again.");
      navigate("/auth/register");
      return;
    }
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      await verifyOtp(email, otpCode);
      toast.success("Email verified successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    toast.info("OTP resend feature coming soon. For now, use: 111111");
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

        {/* OTP Verification Card */}
        <section className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden bg-card">
          {/* Left Side - Image */}
          <div className="hidden md:block md:w-1/2 relative min-h-[600px]">
            <img
              alt="Luxury dates"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9heGlgLRzIMrV5pRDO_VVPJ3LjIrcpVp_zjG0ReBJtL-6vegmh0wUZ16ZT3oXCINje5ujDQ65exTN2qILVNQM_VbY5QKLt2t4S-anZPtmG-T3laebeRi4v5xsJAdkab64eYVbg3bH3qRvExrTLpRj_fkwEY8EODX5lKipvjKwQ6JmuuhvVziD8sx7g-owQ9YUJHto0gNcwEZcvthcH9nRLc_SErV8c-UoXtsbWYKv82zprMg-hwnwaTq879yB7Qadcy546OcLlEDN"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-12 text-cream">
              <h2 className="font-serif text-3xl mb-4">Secure Verification</h2>
              <p className="text-cream/80 leading-relaxed">
                We've sent a verification code to your email. Enter it below to confirm your
                identity and complete your registration.
              </p>
            </div>
          </div>

          {/* Right Side - OTP Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col bg-card justify-center">
            <div className="mb-10 text-center">
              {/* Email Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-6">
                <Mail className="h-8 w-8 text-gold" />
              </div>

              <span className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-2 block">
                Verification
              </span>
              <h1 className="font-serif text-4xl text-primary mb-2">Enter Code</h1>
              <p className="text-muted-foreground">
                We've sent a 6-digit code to
                <br />
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Input */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-cream-deep/40 border-2 border-border focus:border-gold focus:ring-0 rounded-xl text-foreground transition-all"
                    required
                  />
                ))}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm font-semibold text-gold hover:text-primary transition-colors"
                >
                  Resend Code
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-cream font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4">
              <Link
                to="/auth/register"
                className="font-serif text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                ← Back to Registration
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
