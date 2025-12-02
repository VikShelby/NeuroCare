import NeumorphButton from '@/components/ui/neumorph-button'
import { UserMenu } from '@/components/ui/UserMenu'
import { Settings } from 'lucide-react'
import React from 'react'
import GenMode from './GenMode'

export default function Header() {
  return (
    	<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 rounded bg-primary/15" />
						<span className="text-sm font-semibold">NeuroCare</span>
					</div>
					<nav className="flex items-center gap-3 text-sm">
						<a href="/dashboard" className="text-muted-foreground hover:text-foreground">Home</a>
						<a href="/dashboard/caree" className="text-muted-foreground hover:text-foreground">Caree</a>
                       <GenMode sideOffset={8}  side='bottom' align='end' />
					   <NeumorphButton size={'iconSm'} >
                        <Settings className='size-5' />
                       </NeumorphButton>
                       <UserMenu sideOffset={8}  side='bottom' align='end'>
<span tabIndex={-1} className="flex ml-1 relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-solid outline-transparent data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 w-10 h-10 text-tiny bg-default text-default-foreground rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-gray-400">
                            <img className="flex object-cover w-full h-full transition-opacity !duration-500 opacity-0 data-[loaded=true]:opacity-100" alt="avatar" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" data-loaded="true"/>
                        </span>

                       </UserMenu>
                        
					</nav>
				</div>
			</header>
  )
}
