"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordStrength } from "check-password-strength";
import { ArrowRight, Sparkles } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import FormField from "./FormField";

import { auth } from "@/firebase/client";
import {signIn, signUp} from "@/lib/actions/auth.action";
import {createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {signInWithEmailAndPassword} from "firebase/auth";
import { useState } from "react";


type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: type === "sign-up" ? z.string() : z.string().optional(),
    }).refine((data) => {
        if (type === "sign-up") {
            return data.password === data.confirmPassword;
        }
        return true;
    }, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
};

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const [isResendingEmail, setIsResendingEmail] = useState(false);

    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (type === "sign-up") {
                const { name, email, password } = data;

                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // Send email verification
                await sendEmailVerification(userCredential.user);

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if (!result.success) {
                    toast.error(result.message);
                    return;
                }

                toast.success("Account created! Please check your email to verify your account.");
                router.push("/sign-in");
            } else {
                const { email, password } = data;

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // Check if email is verified
                if (!userCredential.user.emailVerified) {
                    toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
                    return;
                }

                const idToken = await userCredential.user.getIdToken();
                if (!idToken) {
                    toast.error("Sign in Failed. Please try again.");
                    return;
                }

                await signIn({
                    email,
                    idToken,
                });

                toast.success("Signed in successfully.");
                router.push("/");
            }
        } catch (error: any) {
            console.log(error);
            
            // Handle specific Firebase errors
            if (error.code === "auth/email-already-in-use") {
                toast.error("This email is already registered. Please sign in instead.");
            } else if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                toast.error("Invalid email or password.");
            } else if (error.code === "auth/too-many-requests") {
                toast.error("Too many failed attempts. Please try again later.");
            } else {
                toast.error(`There was an error: ${error.message}`);
            }
        }
    };

    const handleResendVerification = async () => {
        const email = form.getValues("email");
        const password = form.getValues("password");

        if (!email || !password) {
            toast.error("Please enter your email and password first.");
            return;
        }

        setIsResendingEmail(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            if (userCredential.user.emailVerified) {
                toast.info("Your email is already verified. You can sign in now.");
                return;
            }

            await sendEmailVerification(userCredential.user);
            toast.success("Verification email sent! Please check your inbox.");
        } catch (error: any) {
            toast.error("Failed to resend verification email. Please try again.");
        } finally {
            setIsResendingEmail(false);
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

    const isSignIn = type === "sign-in";

    return (
        <div className="min-h-screen w-full flex overflow-hidden">
            {/* Left Panel - Welcome Section */}
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

                    {/* Welcome message */}
                    <div className="space-y-6 max-w-md">
                        
                        
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Welcome to
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                ChakriGO
                            </span>
                        </h2>
                        
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Elevate your interview preparation with AI-driven insights, 
                            personalized feedback, and real-time practice sessions.
                        </p>

                        {/* Features list */}
                        <div className="space-y-3 mt-8">
                            {[
                                "Smart AI Interview Simulation",
                                "Real-time Performance Analytics",
                                "Personalized Career Guidance"
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                                    <span className="text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA for existing users */}
                        {!isSignIn && (
                            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-gray-300 mb-4">Already have an account?</p>
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all duration-300 group"
                                >
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
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
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-white mb-2">
                                {isSignIn ? "Welcome Back" : "Create Account"}
                            </h3>
                            <p className="text-gray-400">
                                {isSignIn 
                                    ? "Sign in to continue your journey" 
                                    : "Start your interview preparation journey"}
                            </p>
                        </div>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                {!isSignIn && (
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        label="Name"
                                        placeholder="Your Name"
                                        type="text"
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    label="Email"
                                    placeholder="Your email address"
                                    type="email"
                                />

                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        label="Password"
                                        placeholder="Enter your password"
                                        type="password"
                                    />

                                    {/* Password Strength Indicator - Fixed Height Container */}
                                    <div className="min-h-[60px]">
                                        {!isSignIn && (form.watch("password")?.length ?? 0) > 0 && (
                                            <div className="space-y-2 animate-fade-in">
                                                <div className="flex gap-2">
                                                    {Array.from({ length: 4 }).map((_, i) => {
                                                        const password = form.watch("password") ?? "";
                                                        const strength = passwordStrength(password).id;
                                                        return (
                                                            <div 
                                                                key={i} 
                                                                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                                                                    strength >= i 
                                                                        ? ['bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', 
                                                                           'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]', 
                                                                           'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]', 
                                                                           'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'][strength] 
                                                                        : 'bg-gray-700'
                                                                }`}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                <p className="text-xs text-right text-gray-400">
                                                    Password strength: <span className={`font-semibold ${
                                                        ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'][passwordStrength(form.watch("password") ?? "").id]
                                                    }`}>
                                                        {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength(form.watch("password") ?? "").id]}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isSignIn && (
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            placeholder="Confirm your password"
                                            type="password"
                                        />
                                        {/* Password Match Error - Fixed Height Container */}
                                        <div className="min-h-[24px] mt-1">
                                            {(() => {
                                                const confirmPassword = form.watch("confirmPassword") ?? "";
                                                const password = form.watch("password") ?? "";
                                                return confirmPassword.length > 0 && password !== confirmPassword && (
                                                    <p className="text-xs text-red-400 flex items-center gap-1 animate-fade-in">
                                                        <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                                                        Passwords do not match
                                                    </p>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Forgot Password Link - Sign In Only */}
                                {isSignIn && (
                                    <div className="text-right">
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}

                                <Button 
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-[1.02] mt-6" 
                                    type="submit"
                                >
                                    {isSignIn ? "Sign In" : "Create an Account"}
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
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        {/* Resend Verification Email - Sign In Only */}
                        {isSignIn && (
                            <Button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={isResendingEmail}
                                className="w-full mt-4 bg-transparent border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 font-medium py-3 rounded-xl transition-all duration-300"
                            >
                                {isResendingEmail ? "Sending..." : "Resend Verification Email"}
                            </Button>
                        )}

                        {/* Bottom link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                                {isSignIn ? "Don't have an account?" : "Already have an account?"}
                                <Link
                                    href={!isSignIn ? "/sign-in" : "/sign-up"}
                                    className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                >
                                    {!isSignIn ? "Sign In" : "Sign Up"}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
