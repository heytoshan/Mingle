import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ErrorPage = () => {
  const [isHovering, setIsHovering] = React.useState(false);
  const [isShaking, setIsShaking] = React.useState(false);
  const router = useRouter()

  const handleShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 1000);
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="h-screen poppins-medium bg-DarkIndigo flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-8"
          animate={isShaking ? "shake" : isHovering ? "hover" : ""}
          variants={iconVariants}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          onClick={handleShake}
        >
          <XCircle className="w-24 h-24 text-red-500 mx-auto cursor-pointer" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Oops! Something Went Wrong
        </motion.h1>

        <motion.p
          className="text-gray-300 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Don't worry, it's not you - it's us! Try refreshing the page or going back home.
        </motion.p>

        <div className="flex gap-4 justify-center">
          <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg"
            onClick={() => router.refresh()}
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
