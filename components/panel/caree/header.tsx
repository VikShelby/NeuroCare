import NeumorphButton from '@/components/ui/neumorph-button'
import { UserMenu } from '@/components/ui/UserMenu'
import { List, Option, OptionIcon, Settings, User2 } from 'lucide-react'
import React from 'react'
import GenMode from './GenMode'

export default function Header() {
  return (
    	<header className="sticky top-0 z-30 border-b border-[#E5E5EA]/50 dark:border-[#3A3A3C]/50 backdrop-blur-xl">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-2.5">
						<div className="h-8 w-8 rounded-xl  flex items-center justify-center">
							<img className='w-full h-full ' src='/logo.png' />
						</div>
						<span className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white">NeuroCare</span>
					</div>
					<nav className="flex items-center gap-3">
					{/*	<a href="/dashboard" className="text-muted-foreground hover:text-foreground">Home</a>
						<a href="/dashboard/caree" className="text-muted-foreground hover:text-foreground">Caree</a>
                    */}   <GenMode sideOffset={8}  side='bottom' align='end' />
					
                       <UserMenu sideOffset={8}  side='bottom' align='end'>
                        <span className="flex relative justify-center items-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full ring-2 ring-offset-2 ring-offset-[#F2F2F7] dark:ring-offset-[#1C1C1E] ring-gray-400">
							<User2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </span>
                       </UserMenu>
					</nav>
				</div>
			</header>
  )
}
