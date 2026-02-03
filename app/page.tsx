"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react"
import { BorderBeam } from "@/components/border-beam";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState<string>();
  const scrollableDivRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const div = scrollableDivRef.current;
    const handleScroll = () => {
      if (div) {
        setIsScrolled(div.scrollTop > 1);
        console.log("hello")
      }
    };

    if (div) {
      div.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleRedirect = () => {
    if (email != undefined) window.localStorage.setItem("emailInput", email);
    router.push("/signup")
  }

  const handleChange = (value: string) => {
    setEmail(value);
  }

  return (
    <>
      <div ref={scrollableDivRef} className="h-screen relative scroll-auto overflow-scroll text-gray-300/90 bg-DarkIndigo">

        {/* navbar */}
        <div className="relative w-full py-6 bg-DarkNavy">
          {/* container */}
          <div className="container mx-auto px-8">
            {/* navbar content */}
            <div className="flex items-center h-8 px-2 justify-between">
              {/* logo */}
              <div className="py-1 px-2 text-sm">Dimension</div>
              {/* nav buttons  */}
              <div className="fixed top-9 left-1/2 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 z-50">
                <div className={`flex items-center space-x-5 text-xs rounded-full border border-gray-800/90 py-1 px-0.5 backdrop-blur-sm ${isScrolled ? 'bg-white/4' : ''}`}>
                  <div className="cursor-pointer px-4 py-2 hover:text-gray-300 transition-colors">
                    Features
                  </div>
                  <div className="cursor-pointer px-3 py-1 hover:text-gray-300 transition-colors">
                    About us
                  </div>
                  <div className="cursor-pointer px-4 py-1 hover:text-gray-300 transition-colors">
                    Contact
                  </div>
                  {isScrolled && (
                    <motion.div
                      className="bg-gradient-to-r from-[#a26aef] to-[#f974b0] via-[#f974b0] 
                     text-white px-4 py-2 rounded-full cursor-pointer text-xs"
                      initial={{ x: 5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 10,
                        delay: 0.09
                      }}
                    >
                      Get started
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="py-1 px-2">
                <button className="relative group rounded-md p-[1px] bg-gradient-to-r from-gray-800 to-gray-700 animate-gradient">
                  <span className="relative block rounded-md bg-gradient-to-t from-gray-800 to-DarkNavy px-2 py-1 text-xs">
                    Get started
                  </span>
                </button>
              </div>
            </div>
            {/* border */}
            <div className="absolute h-px bottom-0 w-full left-0">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-800/90 to-transparent">
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 justify-center items-center mt-32" >
          <div className="text-5xl text-white font-semibold" >
            Connect Instantly, Chat Seamlessly
          </div>
          <div className="text-center text-5xl font-semibold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow text-transparent bg-clip-text " >
            <h1>
              Real-Time Conversations, Redefined.
            </h1>
          </div>
          <div className="text-xl " >
            The delightfull smart collaboration platform.
          </div>
        </div>

        <div className="flex justify-center space-x-2 items-center mt-10 " >
          <input
            className="focus:outline-none pr-20 py-3 px-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/20 "
            type="text"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Email address.."
          />
          <div className="relative rounded-xl p-[2px]">
            <BorderBeam size={25} className="opacity-30" />
            <div className=" relative rounded-xl  p-[3px]" >
              <BorderBeam size={50} delay={4} className="opacity-30" />
              <div className=" p-[4px] relative rounded-xl" >
                <BorderBeam size={100} delay={5} className="opacity-30" />
                <button
                  className="py-2 text-white px-4 rounded-xl bg-gradient-to-r from-MineBlue via-MinePink a-[#f475b4] to-MineDarkYellow"
                  onClick={handleRedirect}
                >
                  signup
                </button>
              </div>
            </div>
          </div>
        </div>

      </div >
    </>
  );
}
