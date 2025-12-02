'use client'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import NeumorphButton from '@/components/ui/neumorph-button';
import { useGenMode } from '@/components/panel/caree/GenModeContext';
import Image from 'next/image';


interface RadixDropdownMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}
const GenMode = ({
  side,
  sideOffset,
  align,
  alignOffset,
  
}: RadixDropdownMenuDemoProps) => {
  const { mode, setMode } = useGenMode()

  const labelFor = (m: string) => {
    switch (m) {
      case 'voice-assistant':
        return 'Voice Assistant'
      case 'social-communication-coach':
        return 'Social   Coach'
      case 'expression-speech-support':
        return 'Expression & Speech Support'
      case 'aac-communication':
        return 'AAC Communication'
      default:
        return 'Voice Assistant'
    }
  }

  return (
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
       <NeumorphButton size={'small'}>
        <div className='flex items-center gap-2'>
          <Image src={'/aigen.png'} width={12} height={12} alt='gen ai image' />
          <span>{labelFor(mode)}</span>
        </div>
       </NeumorphButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel>Assistant</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setMode('voice-assistant')}>
            Voice Assistant
            <DropdownMenuShortcut>🗣️</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode('social-communication-coach')}>
            Social Communication Coach
            <DropdownMenuShortcut>🧠💬</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode('expression-speech-support')}>
            Expression & Speech Support
            <DropdownMenuShortcut>🎙️✨</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode('aac-communication')}>
            AAC-style Communication
            <DropdownMenuShortcut>🧩</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
       
     
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default GenMode
