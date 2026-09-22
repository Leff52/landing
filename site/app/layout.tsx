import type { Metadata } from 'next';
import { asset } from '@/lib/asset';
import './globals.css';
import './fonts.css';
import './privacy.css';
import { PrivacyControls } from './privacy-controls';
export const metadata: Metadata = {
  title: 'RentZal — твоя игра, твои люди, твоё место',
  description: 'Найди спортивную игру рядом, узнай стоимость и правила, займи своё место. RentZal объединяет людей, которым хочется играть вместе.',
  icons: { icon: asset('/brand/applogo.svg') },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}<PrivacyControls /></body></html>;
}

