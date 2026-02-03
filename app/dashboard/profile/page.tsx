"use client"
import { UserContext } from '@/app/Provider'
import Particles from '@/components/Particles/Particles'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { UpdateUser } from '@/lib/actions/UpdateUser'
import { UploadImage } from '@/lib/actions/UploadImage'
import { AtSign, Camera, Mail, Trash2 } from 'lucide-react'
import React, { useContext, useState } from 'react'

interface updatedDataType {
  username: string,
  email: string,
}

const Profile = () => {
  const userData = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  async function handleSubmit() {
    try {
      const updatedData: updatedDataType = {
        username: username.trim() || userData?.user.username as string,
        email: email.trim() || userData?.user.email as string,
      }
      const result = await UpdateUser(updatedData)
      console.log(result)
    } catch (e) {
      console.error(e);
    } finally {
      setIsEditing(false)
    }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file);
      setPreviewUrl(url)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileData = buffer.toString("base64");
      const fileObject = {
        fileName: file.name,
        fileType: file.type,
        fileData: fileData,
      }
      const uploadedUrl = await UploadImage(fileObject)
      console.log(uploadedUrl)
    }
  }

  return (
    <div className='text-gray-300/90 poppins-medium relative flex  justify-center items-center min-h-screen p-4'>
      <div className=' w-screen h-[600px] overflow-hidden relative z-10' >
        <Particles
          particleColors={['#af62f3', '#fb60ac']}
          particleCount={300}
          particleSpread={20}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <Card className='absolute z-20 backdrop-blur-sm bg-white/10 w-full max-w-2xl'>
        <CardHeader>
          <CardTitle className='text-gray-300'>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile Picture Section */}
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-6 p-4 rounded-lg bg-white/5'>
              <div className='space-y-4 text-center sm:text-left'>
                <label className='text-sm'>Profile Picture</label>
                <Avatar className='h-24 w-24 border-2 border-white mx-auto sm:mx-0'>
                  <AvatarImage src={previewUrl || userData?.user.avatar!} />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </div>
              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative' >
                  <input
                    type='file'
                    onChange={(e) => handleImage(e)}
                    className='absolute z-10 w-full opacity-0 py-2 cursor-pointer'
                  />
                  <button className=' rounded-lg border-white border bg-MineBlue py-2 px-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity'>
                    <Camera size={18} />
                    <span>Change Picture</span>
                  </button>
                </div>
                <button className='py-2 text-MinePink px-6 border border-white/20 rounded-lg hover:bg-MinePink/30 transition-colors duration-300 flex items-center justify-center gap-2'
                  onClick={() => console.log("Delete that")}
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className='space-y-4 p-4 rounded-lg bg-white/5'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <label htmlFor='username'>Username</label>
                  <div className='relative' >
                    <div className='absolute top-2 left-3 ' >
                      <AtSign className={`h-5 w-5 ${isEditing ? "text-gray-300" : "text-gray-300/40"}`} />
                    </div>
                    <Input
                      id='username'
                      placeholder={userData?.user.username}
                      disabled={!isEditing}
                      value={username}
                      className='bg-white/10 py-2 pl-10 border-white/20'
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label htmlFor='email'>Email</label>
                  <div className='relative' >
                    <div className='absolute top-2 left-3' >
                      <Mail className={`h-5 w-5 ${isEditing ? "text-gray-300" : "text-gray-300/40"}`} />
                    </div>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      placeholder={userData?.user.email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className='bg-white/10 py-2 pl-10 border-white/20'
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className='py-2 px-6 border border-white/20 text-MineDarkYellow rounded-lg hover:bg-MineYellow/10 transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      className=' rounded-lg border-white border bg-MineBlue/70 hover:bg-MineBlue transition-colors duration-300 py-2 px-6'
                      onClick={handleSubmit}
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className='py-2 px-6 border hover:bg-MineYellow/20 border-white/20 rounded-lg text-MineDarkYellow  transition-colors'
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
