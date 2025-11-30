import Link from 'next/link'
import React from 'react'
import { APP_NAME_LINES } from '@/lib/appInfo'

const ProdAtLocalhostLogo = () => {
  return (
    <Link href="/" passHref>
      <div className="hidden md:block flex items-center justify-center h-full p-0.5 hover:cursor-pointer hover:bg-[#1c1e22] rounded-md transition-colors group">
        <h1 className="font-minercraftory anti-aliasing p-0.5 hover:bg-opacity/80 text-product hover:text-white/60 select-none transition-colors blur-[0.2px] text-xl leading-tight tracking-tight text-start">
          {APP_NAME_LINES.map((word, index) => (
            <span className="block uppercase" key={`${word}-${index}`}>
              {word}
            </span>
          ))}
        </h1>
      </div>
    </Link>
  )
}

export default ProdAtLocalhostLogo
