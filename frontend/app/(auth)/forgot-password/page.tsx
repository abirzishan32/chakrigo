"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { auth } from "@/firebase/client";

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
