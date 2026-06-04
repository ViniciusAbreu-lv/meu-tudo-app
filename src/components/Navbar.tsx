"use client";

import React from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">VigilantApp</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Início</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Recursos</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Sobre</a>
            <Button variant="default" className="rounded-full px-6">Começar</Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden absolute w-full bg-background border-b border-border transition-all duration-300 ease-in-out",
        isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md">Início</a>
          <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md">Recursos</a>
          <a href="#" className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md">Sobre</a>
          <div className="pt-2">
            <Button className="w-full rounded-full">Começar</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;