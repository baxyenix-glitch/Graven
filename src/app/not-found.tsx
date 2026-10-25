import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, Flame, ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = {
  title: '404 - Tomb Not Found | Graven',
  description: 'The requested gravestone does not exist or has not been buried yet.',
};

export default function NotFound() {
  return (
    <div className="w-full bg-[#000000] min-h-[calc(100vh-68px)] flex items-center justify-center p-6 lg:p-12 text-white">
      <div className="bento-card p-8 md:p-12 text-center max-w-lg w-full bg-[#0A0A0A] border-2 border-[#222222] shadow-[8px_8px_0_#000000] relative">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <Image
            src="/assets/logo.png"
            alt="Graven logo"
            fill
            sizes="80px"
            className="object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold uppercase tracking-wider mb-4 text-white shadow-[2px_2px_0_#000000]">
          <span className="w-2 h-2 rounded-full bg-[#FF4D6D]" />
          <span>404 - LOST IN THE GRAVEYARD</span>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-white mb-3 uppercase tracking-tight">
          TOMB NOT FOUND
        </h1>

        <p className="font-body text-[#A3A3A3] text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto">
          This token hasn’t been laid to rest in the cemetery yet, or the gravestone has dissolved into the mist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink
            href="/"
            variant="secondary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            BACK TO CEMETERY
          </ButtonLink>
          <ButtonLink
            href="/bury"
            variant="cyan"
            size="md"
            icon={<Flame className="w-4 h-4 text-[#0A0F2E]" />}
          >
            BURY A TOKEN ↗
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
