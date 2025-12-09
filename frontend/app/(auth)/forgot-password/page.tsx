"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ArrowLeft, Mail } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, data.email);
            setEmailSent(true);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (error: any) {
            console.error("Password reset error:", error);
            
            if (error.code === "auth/user-not-found") {
                toast.error("No account found with this email address.");
            } else if (error.code === "auth/too-many-requests") {
                toast.error("Too many requests. Please try again later.");
            } else {
                toast.error("Failed to send password reset email. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            // Get the ID token
            const idToken = await userCredential.user.getIdToken();

            // Check if user exists in our database
            const result = await signUp({
                uid: userCredential.user.uid,
                name: userCredential.user.displayName || "Google User",
                email: userCredential.user.email!,
                password: "", // Google users don't have a password
            });

            // Sign in the user
            await signIn({
                email: userCredential.user.email!,
                idToken,
            });

            toast.success("Signed in with Google successfully!");
            router.push("/");
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            
            if (error.code === "auth/popup-closed-by-user") {
                toast.error("Sign-in cancelled. Please try again.");
            } else if (error.code === "auth/popup-blocked") {
                toast.error("Popup blocked by browser. Please allow popups and try again.");
            } else {
                toast.error("Failed to sign in with Google. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden">
            {/* Left Panel - Info Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-transparent opacity-50"></div>
                
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 backdrop-blur-3xl bg-white/5"></div>
                
                {/* Glowing orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-start px-16 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl"></div>
                            <Image 
                                src="/chakrigo-logo.png" 
                                alt="ChakriGO Logo" 
                                width={56} 
                                height={56}
                                className="relative rounded-full"
                            />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                            ChakriGO
                        </h1>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Reset Your
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Password
                            </span>
                        </h2>
                        
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Don't worry! It happens to the best of us. Enter your email address 
                            and we'll send you a link to reset your password.
                        </p>

                        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <p className="text-gray-300 mb-4">Remember your password?</p>
                            <Link
                                href="/sign-in"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all duration-300 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="flex-1 lg:w-1/2 w-full flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-[#1a1a24] p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <Image src="/chakrigo-logo.png" alt="logo" height={40} width={40} />
                        <h2 className="text-2xl font-bold text-white">ChakriGO</h2>
                    </div>

                    {/* Form Card */}
                    <div className="bg-gradient-to-br from-[#1e1e2e]/80 to-[#2a2a3e]/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
                        {!emailSent ? (
                            <>
                                <div className="mb-8">
                                    <h3 className="text-3xl font-bold text-white mb-2">
                                        Forgot Password?
                                    </h3>
                                    <p className="text-gray-400">
                                        Enter your email address to receive a password reset link
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            label="Email Address"
                                            placeholder="Your email address"
                                            type="email"
                                        />

                                        <Button 
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-[1.02]" 
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Sending..." : "Send Reset Link"}
                                        </Button>
                                    </form>
                                </Form>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gradient-to-br from-[#1e1e2e]/80 to-[#2a2a3e]/60 text-gray-400">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                {/* Google Sign-In Button */}
                                <Button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>

                                {/* Back to Sign In - Mobile */}
                                <div className="mt-6 text-center lg:hidden">
                                    <Link
                                        href="/sign-in"
                                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Check Your Email
                                    </h3>
                                    <p className="text-gray-400">
                                        We've sent a password reset link to
                                        <br />
                                        <span className="text-purple-400 font-semibold">
                                            {form.getValues("email")}
                                        </span>
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <p className="text-sm text-gray-400">
                                        Didn't receive the email? Check your spam folder or{" "}
                                        <button
                                            onClick={() => setEmailSent(false)}
                                            className="text-purple-400 hover:text-purple-300 font-semibold"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => router.push("/sign-in")}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-[1.02]"
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
