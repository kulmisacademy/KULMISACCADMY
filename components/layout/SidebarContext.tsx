'use client';
import { createContext, useContext, useState } from 'react';

interface SidebarCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<SidebarCtx>({ open: false, setOpen: () => {}, toggle: () => {} });

export const useSidebar = () => useContext(Ctx);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen, toggle: () => setOpen(!open) }}>
      {children}
    </Ctx.Provider>
  );
}
