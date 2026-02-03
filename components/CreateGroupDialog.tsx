import React, { useEffect, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom, User } from "@/lib/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { filterUsers } from "@/lib/actions/filterUsers";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "@/components/ui/input";
import CreateGroup from "@/lib/actions/CreateGroup";
import { TypeOf } from "zod";

interface ExtendedChatRoom extends ChatRoom {
  users: ExtendedUser[];
}

interface ExtendedUser extends User {
  isOnline: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export function CreateGroupDialog({ singleChatData, userId }: { singleChatData: ExtendedChatRoom[], userId: number }) {
  const [open, setOpen] = useState(false);
  const [searchResult, setSearchResult] = useState<User[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<number[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [[page, direction], setPage] = useState([0, 0]);
  const [inputValue, setInputValue] = useState('');

  async function getData() {
    if (!inputValue.trim()) return;
    const data = await filterUsers(inputValue.trim())
    if (!data) {
      setSearchResult(null);
      return;
    }
    setSearchResult(data);
    console.log(data)
  }
  useEffect(() => {
    const delayedTimeOut = setTimeout(() => {
      getData()
    }, 300);
    return () => clearTimeout(delayedTimeOut)
  }, [inputValue])


  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  async function handleCreateGroup() {
    console.log({ groupName, selectedUsers: selectedUser });
    const result = await CreateGroup(selectedUser, groupName)
    console.log(result)
    setOpen(false);
    setShowNameInput(false);
    setGroupName('');
    setSelectedUser([]);
    setPage([0, 0]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:bg-white/10 px-4 rounded-lg py-2 text-white/50 hover:text-white transition-all duration-300 cursor-pointer">
          <span>+</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-white/60 bg-DarkNavy overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showNameInput ? 'Name Your Group' : 'Find Users'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {!showNameInput ? (
              <div className="space-y-4">
                <div className="py-4">
                  <Command className="rounded-lg border">
                    <CommandInput
                      placeholder="Search users...."
                      className="backdrop-blur-md bg-white/5"
                      onValueChange={(e => setInputValue(e))}
                    />
                    <CommandList>

                      {searchResult != null && (
                        <div>
                          {searchResult.length == 0 && (<CommandEmpty>No result found.</CommandEmpty>)}
                          <CommandGroup>
                            {searchResult.map((user) => (
                              <CommandItem key={user.id} className="bg-white/10 cursor-pointer text-white mb-2 mt-2" >
                                <div className="flex items-center mb-2 gap-2 mx-2 " >
                                  <div>
                                    <Avatar className="border border-white" >
                                      <AvatarImage src={user.avatar || "https://githubusercontent.com"} />
                                      <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div>
                                    <div className="text-sm" >
                                      {user.username}
                                    </div>
                                    <div className="text-xs text-gray-300/80" >
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </div>
                      )}
                    </CommandList>
                  </Command>
                </div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {singleChatData.map((data) =>
                    data.users.map(
                      (user) =>
                        user.id !== userId && (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className={`group p-4 border ${selectedUser.includes(user.id) ? "border-white" : "border-white/10"
                                } rounded-lg bg-white/5 
                              transition-all duration-200 ease-in-out
                              flex items-center gap-4`}
                            >
                              <div className="flex items-center">
                                <Checkbox
                                  className="border-white/20"
                                  checked={selectedUser.includes(user.id)}
                                  onCheckedChange={(v) => {
                                    if (v) {
                                      setSelectedUser((prev) => [...prev, user.id]);
                                    } else {
                                      setSelectedUser((prev) =>
                                        prev.filter((el) => el !== user.id)
                                      );
                                    }
                                  }}
                                />
                              </div>

                              <div className="relative flex-shrink-0">
                                <Avatar className="h-12 w-12 border-2 border-darkNavy">
                                  <AvatarImage
                                    src={"https://avatars.githubusercontent.com/u/124599?v=4" || user.avatar}
                                    alt={user.username}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-darkNavy text-white">
                                    {user.username?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div
                                  className={`absolute -right-0 -bottom-0 h-3 w-3 rounded-full 
                                  ring-2 ring-darkNavy transition-all
                                  ${user.isOnline ? "bg-green-400" : "bg-gray-400"}
                                  ${user.isOnline ? "animate-pulse" : ""}`}
                                />
                              </div>

                              <div className="flex flex-col min-w-0">
                                <span className="text-white font-medium truncate">
                                  {user.username}
                                </span>
                                <span className="text-sm text-white/40 truncate">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                    )
                  )}
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="flex gap-2">
          {selectedUser.length > 0 && !showNameInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowNameInput(true);
                  paginate(1);
                }}
                className="bg-gradient-to-r transition-all duration-300 from-MineBlue via-MinePink to-MineDarkYellow text-white"
              >
                Next
              </Button>
            </motion.div>
          )}

          {showNameInput && (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setShowNameInput(false);
                  paginate(-1);
                }}
                className="text-white/60 border-white/10 bg-white/5 hover:bg-white/5"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!groupName.trim()}
                onClick={handleCreateGroup}
                className="bg-gradient-to-r transition-all duration-300 from-MineBlue via-MinePink to-MineDarkYellow text-white"
              >
                Create Group
              </Button>
            </motion.div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
