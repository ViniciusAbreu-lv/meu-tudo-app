"use client";

import React from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Construa o futuro da sua aplicação
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Uma plataforma robusta, escalável e incrivelmente rápida para gerenciar seus projetos com a eficiência que você merece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8 text-lg h-14">
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Alta Performance</h3>
              <p className="text-muted-foreground">Otimizado para velocidade máxima em qualquer dispositivo ou conexão.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
              <p className="text-muted-foreground">Proteção de dados de nível empresarial para sua tranquilidade.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Escala Global</h3>
              <p className="text-muted-foreground">Infraestrutura pronta para crescer junto com o seu negócio.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;