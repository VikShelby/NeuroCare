import { Button } from '@/components/ui/button';
import { useState } from 'react';
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
import NeumorphButton from '../ui/neumorph-button';

interface RadixDropdownMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  items: Array<string>;
  title: string;
    selected: string;
    setSelected: (item: string) => void;
}

export function AuthMenu({
  side,
  sideOffset,
  align,
  alignOffset,
  items,
  title,
  selected ,
    setSelected,
}: RadixDropdownMenuDemoProps) {
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='w-full' asChild>
        <NeumorphButton  size={'pop'} intent="secondary">{selected}</NeumorphButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuGroup>
            {
            items.map((item) => (
              <DropdownMenuItem key={item} onSelect={() => setSelected(item)}>
                {item}
              </DropdownMenuItem>
            ))
            }
          
        </DropdownMenuGroup>
      
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}