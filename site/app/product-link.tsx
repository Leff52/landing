'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { rentzal } from '@/lib/rentzal';

export function ProductLink({children, className = ''}: {children: ReactNode; className?: string}) {
  if (rentzal.publicUrl) return <a className={className} href={`${rentzal.publicUrl}/slots`}>{children}</a>;
  return <Dialog>
    <DialogTrigger className={className}>{children}</DialogTrigger>
    <DialogContent className="launch-dialog">
      <img src="/brand/applogo.svg" alt="" width="56" height="56"/>
      <p className="eyebrow">RENTZAL / ЛОКАЛЬНАЯ ВЕРСИЯ</p>
      <DialogTitle className="launch-title">Заглянем в игру?</DialogTitle>
      <DialogDescription className="launch-description">Сейчас RentZal работает локально. Каталог откроется на компьютере, где запущено приложение.</DialogDescription>
      <a className="button" href={`${rentzal.localUrl}/slots`} target="_blank" rel="noopener noreferrer">Открыть локальный RentZal <ArrowUpRight size={20}/></a>
      <p className="launch-note">Если приложение не запущено, страница каталога будет недоступна.</p>
    </DialogContent>
  </Dialog>;
}
