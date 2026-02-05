"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupSchemaType } from "@/utils/signupSchema";
import LogoIs from "@/components/LogoIs";
import { signup } from "@/services/api/auth";
import { useToast } from "./ToastContext";
import { useRouter } from "next/navigation";

const SignInForm = () => {
  const [oauth, setOauth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.185:3001";

  const handleOAuth = (provider: "google" | "github") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    setValue,
    trigger
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("error", "Image too large (max 2MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue("avatar", base64String, { shouldValidate: true });
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SignupSchemaType) => {
    setLoading(true);
    console.log("Form Submitted:", data);
    try {
      const result = await signup(data);
      addToast("success", "User created successfully!")
      setTimeout(() => {
        console.log("Redirecting to login page...");
      }, 3000);
      router.push("/sign-in");
    } catch (error: any) {
      console.error("Signup error:", error.message);
      addToast("error", error.message)
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpForm = (e: any) => {
    e.preventDefault();
    setOauth(false);
  };

  return (
    <section className="w-full px-4 md:px-0">
      <div className="m-4 md:m-6">
        <h1 className="text-2xl md:text-3xl">
          <LogoIs />
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center py-4 md:py-10 w-full">
        {/* Left Content */}
        <div className="hidden md:block w-full max-w-xl md:max-w-2xl p-4 md:p-6 md:mr-6 lg:mr-24 text-center md:text-left">
          <h1 className="text-2xl md:text-[32px] font-bold mb-4 md:mb-6 text-gray-700">
            Explore <LogoIs />'s task management platform
          </h1>
          <p className="mb-4 md:mb-6 text-gray-800 text-sm md:text-base">
            Setup your team and projects like Jira, and manage task, team and
            more in minutes. Join for free.
          </p>
          <h4 className="text-lg md:text-xl font-bold mb-6 md:mb-8">
            No credit card required.
          </h4>
          <ul className="list-disc list-inside mb-4 md:mb-6 space-y-2 text-sm md:text-base">
            <li className="text-gray-700">Easy setup via web interface</li>
            <li className="text-gray-700">
              Integrates with your team and manage your projects
            </li>
            <li className="text-gray-700">
              Transparent and predictable pricing
            </li>
            <li className="text-gray-700">24/7 technical support</li>
          </ul>
          <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-800">
            Authenticate using major providers, including:
          </h3>
          <div className="flex justify-center md:justify-start space-x-4 md:space-x-6 mb-6 md:mb-0">
            <img className="w-8 md:w-10" src="/google.svg" alt="Google" />
            <img className="w-8 md:w-10" src="/github.svg" alt="GitHub" />
            <img className="w-8 md:w-10" src="/facebook.svg" alt="Facebook" />
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full max-w-md md:max-w-xl bg-transparent border-2 shadow-lg md:shadow-2xl rounded-md opacity-90 px-6 md:px-8 pt-4 md:pt-6 pb-6 md:pb-8 mb-4">
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Create your free "<LogoIs />" account
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!oauth && (
              <div className="my-4 space-y-4">
                {/* username and avatar */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* username */}
                  <div className="flex-1">
                    <label className="block text-gray-800 text-sm mb-2" htmlFor="username">
                      Username
                    </label>
                    <input
                      className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.username && touchedFields.username ? "border-red-500" : "border-gray-300"
                        }`}
                      id="username"
                      type="text"
                      placeholder="John Smith"
                      {...register("username")}
                    />
                    <span className="text-red-500 text-xs">
                      {errors.username && touchedFields.username && errors.username.message}
                    </span>
                  </div>

                  {/* avatar */}
                  <div className="flex-1">
                    <label className="block text-gray-800 text-sm mb-2" htmlFor="avatarUrl">
                      Avatar
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.avatar && touchedFields.avatar ? "border-red-500" : "border-gray-300"
                          }`}
                        id="avatarUrl"
                        type="url"
                        placeholder="Image URL"
                        {...register("avatar")}
                        onChange={(e) => {
                          if (e.target.value) {
                            setValue("avatar", e.target.value, { shouldValidate: true });
                            setAvatarPreview(e.target.value);
                          }
                        }}
                      />

                      <div className="relative">
                        <input
                          type="file"
                          id="avatarFile"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label htmlFor="avatarFile" className="cursor-pointer">
                          {avatarPreview ? (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200">
                              <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/user-placeholder.png';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <span className="text-red-500 text-xs">
                      {errors.avatar && touchedFields.avatar && errors.avatar.message}
                    </span>
                  </div>
                </div>

                {/* email */}
                <div>
                  <label className="block text-gray-800 text-sm mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.email && touchedFields.email ? "border-red-500" : "border-gray-300"
                      }`}
                    id="email"
                    type="email"
                    placeholder="email@yourcompany.com"
                    {...register("email")}
                  />
                  <span className="text-red-500 text-xs">
                    {errors.email && touchedFields.email && errors.email.message}
                  </span>
                </div>

                {/* password */}
                <div>
                  <label className="block text-gray-800 text-sm mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.password && touchedFields.password ? "border-red-500" : "border-gray-300"
                      }`}
                    id="password"
                    type="password"
                    placeholder="********"
                    {...register("password")}
                  />
                  <span className="text-red-500 text-xs">
                    {errors.password && touchedFields.password && errors.password.message}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* role */}
                  <div className="w-full">
                    <label className="block text-gray-800 text-sm mb-2" htmlFor="role">
                      Role
                    </label>
                    <input
                      className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.role && touchedFields.role ? "border-red-500" : "border-gray-300"
                        }`}
                      id="role"
                      type="text"
                      placeholder="Frontend Developer"
                      {...register("role")}
                    />
                    <span className="text-red-500 text-xs">
                      {errors.role && touchedFields.role && errors.role.message}
                    </span>
                  </div>

                  {/* compcode */}
                  <div className="w-full">
                    <label className="block text-gray-800 text-sm mb-2" htmlFor="compcode">
                      Company Code
                    </label>
                    <input
                      className={`border w-full py-2 px-3 text-sm text-gray-700 focus:outline-none focus:shadow-outline ${errors.compcode && touchedFields.compcode ? "border-red-500" : "border-gray-300"
                        }`}
                      id="compcode"
                      type="text"
                      placeholder="TASK360"
                      {...register("compcode")}
                    />
                    <span className="text-red-500 text-xs">
                      {errors.compcode && touchedFields.compcode && errors.compcode.message}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 items-center justify-between">
              {oauth && (
                <>
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
                  <div className="flex items-center w-full gap-3 text-xs md:text-sm text-gray-500">
                    <span className="h-px w-full bg-gray-200" />
                    <span className="whitespace-nowrap">or continue with email</span>
                    <span className="h-px w-full bg-gray-200" />
                  </div>
                </>
              )}

              <button
                className={`flex items-center justify-center text-white w-full font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${oauth ? 'bg-primary hover:bg-blue-900 cursor-pointer' :
                  (!isValid || loading) ? 'bg-blue-200 hover:bg-blue-300 cursor-not-allowed' :
                    'bg-primary hover:bg-blue-900 cursor-pointer'
                  }`}
                type={oauth ? "button" : "submit"}
                onClick={oauth ? handleSignUpForm : undefined}
                disabled={!oauth && (!isValid || loading)}
              >
                {!loading && (
                  <Image
                    width={20}
                    height={20}
                    className="mx-2 md:mx-4 invert"
                    src="email.svg"
                    alt="Email"
                  />
                )}
                {!loading ? (
                  <span className="text-sm md:text-base">
                    {oauth ? "Sign In with email" : "Register with email"}
                  </span>
                ) : (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin inline-block size-5 md:size-6 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading">
                    </div>
                    <span className="mx-2 md:mx-4 text-sm md:text-base">Creating...</span>
                  </div>
                )}
              </button>
            </div>

            <p className="pt-4 text-sm text-center md:text-left">
              Already have account on <LogoIs />?{" "}
              <Link href="/sign-in" prefetch={true} className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignInForm;
