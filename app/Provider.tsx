"use client";
import ErrorPage from '@/components/Error';
import Loading from '@/components/Loading';
import { UserData } from '@/lib/actions/GetUserData'
import { User } from '@/lib/types'
import React, { createContext } from 'react'

type UserContextType = {
  user: User,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export const UserContext = createContext<UserContextType | null>(null)

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function getData() {
      try {
        const userData = await UserData();
        if (!userData) {
          setUser(null)
          return;
        }
        setUser(userData);
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    getData();
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }

  if (!user) {
    return (
      <ErrorPage />
    )
  }

  const contextValue: UserContextType = {
    user: user,
    setUser: setUser
  }
  return (
    <>
      <UserContext.Provider value={contextValue}>
        {children}
      </UserContext.Provider>
    </>
  )
}

export default UserProvider
