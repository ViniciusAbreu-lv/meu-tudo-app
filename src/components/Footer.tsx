"use client";

import React from 'react';
import { MadeWithDyad } from "./made-with-dyad";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VigilantApp. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Contato</a>
          </div>
        </div>
        <div className="mt-8">
          <MadeWithDyad />
        </div>
      </div>
    </footer>
  );
};

export default Footer;