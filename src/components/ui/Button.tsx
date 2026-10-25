'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'cyan' | 'lime' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export interface ButtonProps
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  as?: 'button';
}

export interface ButtonLinkProps
  extends BaseButtonProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> {
  href: string;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-[#1237E8] text-[#FFFFFF] hover:bg-[#0A1FC4]',
  secondary: 'bg-[#FFFFFF] text-[#000000] hover:bg-[#EAEAEA]',
  cyan: 'bg-[#5CE1FF] text-[#0A0F2E] hover:brightness-105',
  lime: 'bg-[#E4FF6B] text-[#0A0F2E] hover:brightness-105',
  ghost: 'bg-transparent text-white border-transparent shadow-none hover:bg-white/10',
  danger: 'bg-[#FF4D6D] text-[#FFFFFF] hover:bg-[#E03A58]',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-3.5 py-1.5 text-xs',
  md: 'min-h-[44px] px-5 py-2.5 text-xs sm:text-[13px]',
  lg: 'min-h-[50px] px-7 py-3 text-sm sm:text-base',
};

const BASE_STYLES =
  'inline-flex items-center justify-center gap-2 font-ui font-bold uppercase tracking-wider rounded-[16px] border-[2px] border-[#000000] shadow-[3px_3px_0_#000000] transition-all duration-150 select-none cursor-pointer focus-visible:outline-3 focus-visible:outline-[#5CE1FF] focus-visible:outline-offset-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000000] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[3px_3px_0_#000000] touch-manipulation';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const isGhost = variant === 'ghost';
  const variantClass = VARIANT_STYLES[variant];
  const sizeClass = SIZE_STYLES[size];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${BASE_STYLES} ${variantClass} ${sizeClass} ${widthClass} ${
        isGhost ? '!border-transparent !shadow-none' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  fullWidth = false,
  ...props
}: ButtonLinkProps) {
  const isGhost = variant === 'ghost';
  const variantClass = VARIANT_STYLES[variant];
  const sizeClass = SIZE_STYLES[size];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <Link
      href={href}
      className={`${BASE_STYLES} ${variantClass} ${sizeClass} ${widthClass} ${
        isGhost ? '!border-transparent !shadow-none' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
