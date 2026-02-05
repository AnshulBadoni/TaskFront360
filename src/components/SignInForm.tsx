"use client";

import { signin } from "@/services/api/auth";
import { SigninSchemaType, signinSchema } from "@/utils/signinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { useToast } from "./ToastContext";
import { getAuthToken, getCookieData, setAuthToken, setUserData } from "@/utils/cookies";

interface LoginResponse {
  status: number;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    rememberMe: boolean;
    compcode: string;
    token: string;
    role?: string;
    avatar?: string;
  };
}

const SignInForm = () => {
  const [emailDone, setEmailDone] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.185:3001";

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
    watch,
  } = useForm<SigninSchemaType>({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
  });

  const rememberMe = watch("rememberMe");
  const { addToast } = useToast();

  const onSubmit = async (data: SigninSchemaType) => {
    setIsLoading(true);
    setError("");

    try {
      const result: LoginResponse = await signin(data);
      if (result.status === 200) {
        const { token, id, username, email, compcode, role = "" } = result.data;
        // Set cookies
        setAuthToken(token, data.rememberMe);
        setUserData({ id, username, email, compcode, role }, data.rememberMe);
        addToast("success", "Login successful!", "top-right");
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setEmailDone(true);
        addToast("error", result.message, "top-right");
        setError(result.message);
      }
    } catch (error: any) {
      setEmailDone(true);
      addToast("error", error.message, "top-right");
    } finally {
      // Reset the form in all cases (success or error)
      reset({
        email: "",
        password: "",
        rememberMe: false
      });
      setIsLoading(false);
    }
  };

  const handleSignInForm = (e: any) => {
    setEmailDone(false);
  };

  return (
    <section>
      <div className="m-6">
        <h1 className="font-bold text-3xl">
          task<span className="text-blue-600">360</span>
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center h-[80dvh]">
        <div className="bg-transparent border-2 shadow-2xl rounded-md opacity-90 px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
          <h1 className="text-2xl font-bold mb-4">Log in to console</h1>
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3 mb-4">
              <button
                className="flex items-center justify-center bg-transparent hover:bg-blue-500/10 text-blue-800 w-full py-2 px-4 rounded border border-blue-800 focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => handleOAuth("google")}
              >
                <img className="w-5 md:w-6 mx-2 md:mx-4" src="google.svg" alt="Google" />
                <span className="text-sm md:text-base">Sign in with Google</span>
              </button>
              <button
                className="flex items-center justify-center bg-transparent hover:bg-blue-500/10 text-blue-800 w-full py-2 px-4 rounded border border-blue-800 focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => handleOAuth("github")}
              >
                <img className="w-5 md:w-6 mx-2 md:mx-4" src="github.svg" alt="GitHub" />
                <span className="text-sm md:text-base">Sign in with Github</span>
              </button>
            </div>
            <div className="flex items-center w-full gap-3 text-xs md:text-sm text-gray-500 mb-4">
              <span className="h-px w-full bg-gray-200" />
              <span className="whitespace-nowrap">or continue with email</span>
              <span className="h-px w-full bg-gray-200" />
            </div>
            {emailDone ? (
              <>
                <div className="mb-4">
                  <label
                    className="block text-gray-800 text-sm mb-2"
                    htmlFor="username"
                  >
                    Email
                  </label>
                  <input
                    className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.email && touchedFields.email
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    id="username"
                    type="text"
                    placeholder="email@yourcompany.com"
                    {...register("email")}
                  />
                  <span className="text-red-500 text-xs">
                    {errors.email && touchedFields.email && errors.email.message}
                  </span>
                </div>
                <div className="mb-4 flex">
                  <input
                    className="size-4 mt-0.5"
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                  />
                  <label
                    className="ml-2 text-gray-700 text-sm"
                    htmlFor="rememberMe"
                  >
                    Remember me
                  </label>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <label
                  className="block text-gray-800 text-sm mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.password && touchedFields.password
                    ? "border-red-500"
                    : "border-gray-300"
                    }`}
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register("password")}
                />
                <span className="text-red-500 text-xs">
                  {errors.password &&
                    touchedFields.password &&
                    errors.password.message}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                className={`flex items-center justify-center text-white w-full font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : touchedFields.email && !errors.email
                    ? "bg-primary hover:bg-blue-900 cursor-pointer"
                    : "bg-blue-200 hover:bg-blue-300 cursor-not-allowed"
                  }`}
                onClick={emailDone ? handleSignInForm : undefined}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Log in"}
              </button>
            </div>
            <p className="pt-4 text-sm">
              New to task360?{" "}
              <Link href="/sign-up" prefetch={true} className="text-blue-600">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInForm;
