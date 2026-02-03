"use client";
import React, { useState } from "react";
import {
  isUsernameAllowed,
  handleEmailValidation,
  CreateAccount,
} from "@/lib/actions";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { UserSignUp } from "@/lib/types";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/border-beam";
import Link from "next/link";

enum activeInput {
  nothing,
  firstName,
  lastname,
  username,
  email,
  password,
}


export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignUp>();
  const [userName, setUserName] = useState(true);
  const [otpValue, setOtpValue] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [focused, setFocused] = useState<activeInput>(0);

  const router = useRouter();
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    return true;
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const onSubmit: SubmitHandler<UserSignUp> = async (data: UserSignUp) => {
    const error = await handleEmailValidation(data);
    const loadingToast = toast.loading("Loading...");
    if (error) {
      toast.error(String(error), {
        id: loadingToast,
      });
    } else {
      toast.success("OTP send Successfully", {
        id: loadingToast,
      });
      handleOpenDialog();
    }
  };

  async function validateOtp(userData: UserSignUp) {
    const otp: number = Number(otpValue);
    const errorWhileCreating = await CreateAccount(userData, otp);
    const loadingToast = toast.loading("Loading...");
    if (errorWhileCreating) {
      toast.error(String(errorWhileCreating), {
        id: loadingToast,
      });
    } else {
      toast.success("Account Successfully Created", {
        id: loadingToast,
      });
      handleCloseDialog();
      router.push("/dashboard");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <section className="bg-DarkIndigo text-gray-300/90 min-h-screen">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a
              href="#"
              className="flex items-center mb-6 text-2xl font-semibold text-transparent bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text"
            >
              One Click Away from Greatness
            </a>
            <div className="w-full  bg-white/5 border border-gray-800/30  rounded-lg  md:mt-0 sm:max-w-md xl:p-0 ">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create an account
                </h1>
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block mb-2 text-sm font-medium"
                    >
                      First Name
                    </label>
                    <div className=" rounded-lg relative w-full " >
                      {focused === 1 ?
                        <BorderBeam
                          size={90}
                          delay={1}
                          className="absolute z-10"
                        /> : ""
                      }
                      <input
                        type="text"
                        id="firstName"
                        placeholder="jhon"
                        onFocus={() => setFocused(1)}
                        className=" px-4 py-3 placeholder-white/20 bg-white/5 focus:border-white/20 border backdrop-blur-md w-full focus:outline-none rounded-lg  "
                        {...register("firstname", { required: true })}
                        onBlur={() => setFocused(0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block mb-2 text-sm font-medium "
                    >
                      Last Name
                    </label>
                    <div className="relative w-full rounded-lg" >
                      {focused == 2 ?
                        <BorderBeam
                          size={90}
                          delay={2}
                          className="absolute z-10"
                        /> : ""
                      }
                      <input
                        type="text"
                        id="lastName"
                        placeholder="doe"
                        className="rounded-lg placeholder-white/20 px-4 py-3 w-full bg-white/5 backdrop-blur-md focus:outline-none border focus:border-white/20"
                        {...register("lastname")}
                        onFocus={() => setFocused(2)}
                        onBlur={() => setFocused(0)}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium"
                    >
                      username
                    </label>
                    <div className="relative w-full rounded-lg" >
                      {focused == 3 ?
                        <BorderBeam
                          size={90}
                          className="absolute z-10"
                          delay={3}
                        /> : ""
                      }
                      <input
                        type="text"
                        id="username"
                        placeholder="@jhoneDoe"
                        className="px-4 py-3 placeholder-white/20 rounded-lg w-full bg-white/5 focus:outline-none focus:border-white/20 border "
                        {...register("username", {
                          required: true,
                          validate: async (value) => {
                            const isAllowed = await isUsernameAllowed(value);
                            setUserName(isAllowed);
                            return isAllowed || "Username is already taken";
                          },
                        })}
                        onFocus={() => setFocused(3)}
                        onBlur={() => setFocused(0)}
                      />
                    </div>
                    {userName ? (
                      ""
                    ) : (
                      <p className="text-red-500 p-2">
                        username already exists
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium  "
                    >
                      Your email
                    </label>
                    <div className="relative rounded-lg w-full" >
                      {focused === 4 ?
                        <BorderBeam
                          size={90}
                          delay={4}
                          className="absolute z-10"
                        /> : ""
                      }
                      <input
                        type="email"
                        id="email"
                        className="w-full py-3 rounded-lg placeholder-white/20 border bg-white/5 px-3 focus:outline-none focus:border-white/20"
                        placeholder="name@company.com"
                        {...register("email", { required: true })}
                        onBlur={() => setFocused(0)}
                        onFocus={() => setFocused(4)}
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
                      {focused == 5 ?
                        <BorderBeam
                          size={90}
                          delay={5}
                          className="absolute z-10"
                        /> : ""
                      }
                      <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        className="py-3 w-full placeholder-white/20 rounded-lg px-3 bg-white/5 focus:outline-none focus:border-white/20 border "
                        {...register("password", { required: true })}
                        onFocus={() => setFocused(5)}
                        onBlur={() => setFocused(0)}
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full text-white bg-gradient-to-r from-MineBlue via-MinePink to-MineDarkYellow focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  dark:focus:ring-purple-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
                      disabled={!userName}
                    >
                      Verify your email
                    </button>
                    <Dialog open={isDialogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Verify Your Email</DialogTitle>
                          <DialogDescription>
                            enter you one time password (OTP)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <InputOTP
                            maxLength={4}
                            value={otpValue}
                            onChange={(value) => setOtpValue(value)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot index={1} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <button
                              type="button"
                              onClick={handleSubmit(validateOtp)}
                            >
                              Verify
                            </button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-primary-600 hover:underline hover:text-white"
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <Toaster />
    </div>
  );
}
