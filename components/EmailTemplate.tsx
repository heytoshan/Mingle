import * as React from 'react';

interface EmailTemplateProps{
  firstname : string,
  otp : number
}
  export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({firstname,otp}) => {
    return(
      <div className='h-16 m-6 text-xl flex flex-col p-5 justify-center items-center'>
      <h1 className='flex justify-center p-5'>Mingle</h1>
      <div className='font-semibold text-2xl p-5'>Hey {firstname}, Here is your One Time Password</div>
      <div className='p-5'>to validate your email. Only valid for 2 min</div>
      <div className='text-4xl font-bold'>{otp}</div>
      </div>
    )
  }
