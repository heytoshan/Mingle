import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { File } from 'lucide-react'

interface FileDialogType {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  file: File | undefined
}
const FileDialog: React.FC<FileDialogType> = ({ open, setOpen, file }) => {
  const [filesize, setFileSize] = useState<string>('')

  useEffect(() => {
    const size = (file?.size! / 1000000).toFixed(2);
    setFileSize(size)
  }, [file])
  if (!file) {
    setOpen(false)
  }
  function handlSubmit() {
    const fileReader = new FileReader();
    if (file) {
      fileReader.readAsDataURL(file)
      fileReader.onload = function (evt) {
        const file = evt.target?.result;
        console.log(file)
      }
      setOpen(false);
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='bg-DarkNavy text-gray-300/80'>
          <DialogTitle className='text-sm'>
            {file?.name}
          </DialogTitle>
          <div className='bg-white/20 rounded-lg'>
            <div className='p-10 flex gap-3 flex-col items-center justify-center'>
              <File className='h-8 w-8' />
              <div className='text-sm' >
                {filesize}{" "}MB
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' onClick={handlSubmit} className='bg-blue-800 hover:bg-blue-800/90' variant={"secondary"} >
              send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FileDialog
