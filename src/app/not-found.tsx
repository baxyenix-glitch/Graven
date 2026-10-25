import Link from 'next/link';
import Image from 'next/image';
import { StarburstSticker } from '@/components/ui/DesignDecorations';

export default function NotFound() {
  return (
    <div className="w-full bg-[#F6F4FF] min-h-[60vh] flex items-center justify-center p-6 lg:p-12">
      <div className="bento-card p-8 md:p-12 text-center max-w-md w-full bg-white relative">
        <StarburstSticker
          fillColor="#5CE1FF"
          className="w-14 h-14 absolute -top-4 -right-4 rotate-12"
        />

        <div className="w-24 h-24 mx-auto mb-6 relative">
          <Image
            src="/assets/logo.png"
            alt="Graven mascot"
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>

        <div className="inline-block px-3.5 py-1 rounded-full bg-[#BFD8FF] border-2 border-[#0A0F2E] text-xs font-mono font-bold uppercase tracking-wider mb-4 text-[#0A0F2E]">
          404 - LOST IN THE GRAVEYARD
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-[#0A0F2E] mb-3 uppercase tracking-tight">
          TOMB NOT FOUND
        </h1>

        <p className="font-body text-[#0A0F2E]/80 text-sm md:text-base mb-8 leading-relaxed">
          This coin hasn’t been buried here yet, or the gravestone has vanished into the mist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-bento bg-[#E4FF6B] text-[#0A0F2E] text-xs py-3.5 px-5">
            BACK TO CEMETERY ↗
          </Link>
          <Link href="/bury" className="btn-bento bg-white text-[#0A0F2E] text-xs py-3.5 px-5">
            BURY A TOKEN
          </Link>
        </div>
      </div>
    </div>
  );
}
