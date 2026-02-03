"use client"
import React, { useState } from "react";
import { LoginHandler } from "@/lib/actions";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BorderBeam } from "@/components/border-beam";

enum activeInput {
  nothing,
  email,
  password,
}

export default function Login() {
  const router = useRouter();
  const [focused, setFocused] = useState<activeInput>(0);
  return (
    <div>
      <form
        action={async (formData: FormData) => {
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;
          const toastId = toast.loading("Loading...");
          const error = await LoginHandler(email, password);
          if (error) {
            toast.error(String(error), {
              id: toastId
            })
          } else {
            toast.success("Successfully loggin", {
              id: toastId
            })
            router.push("/dashboard");
          }
        }}>

        <section className="bg-DarkIndigo text-gray-300/90 ">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div
              className=" items-center mb-6 text-2xl font-semibold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent "
            >
              Back for More? We Knew You&rsquo;d Return!
            </div>
            <div className="w-full bg-white/5 border-gray-800/30 rounded-lg md:mt-0 sm:max-w-md xl:p-0 ">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Welcome Back!
                </h1>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium "
                  >
                    Your email
                  </label>
                  <div className="relative rounded-lg w-full" >
                    {focused == 1 ?
                      <BorderBeam
                        size={90}
                        delay={focused}
                        className="absolute z-10"
                      /> : ""
                    }
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="bg-white/5 py-3 backdrop-blur-md placeholder-white/20 px-4 w-full rounded-lg focus:outline-none focus:border-white/20 border"
                      placeholder="name@company.com"
                      onFocus={() => setFocused(1)}
                      onBlur={() => setFocused(0)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium "
                  >
                    Password
                  </label>
                  <div className="relative rounded-lg w-full" >
                    {focused == 2 ?
                      <BorderBeam
                        size={90}
                        delay={focused}
                        className="absolute z-10"
                      />
                      : ""
                    }
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="rounded-lg bg-white/5 px-4 py-3 w-full backdrop-blur-md focus:outline-none focus:border-white/20 border placeholder-white/20"
                      required
                      onBlur={() => setFocused(0)}
                      onFocus={() => setFocused(2)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full text-white  font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow"
                >
                  Login
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Don&apos;t Have Any Account?
                  <Link
                    href="/signup"
                    className="font-medium text-primary-600 hover:underline hover:text-white"
                  >
                    Signup
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <Toaster />
        </section>
      </form>
    </div>
  );
}
