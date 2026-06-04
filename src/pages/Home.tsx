"use client";

import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Plus, CheckCircle2, Circle } from 'lucide-react';

const Home = () => {
  const { user, signOut } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Minhas Tarefas</h1>
            <p className="text-muted-foreground">Olá, {user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Lista de Afazeres</CardTitle>
                <Button size="sm" className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center p-4 hover:bg-accent/50 transition-colors group">
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground group-hover:text-primary">
                      <Circle className="h-5 w-5" />
                    </Button>
                    <span className="ml-3 flex-grow font-medium">Exemplo de tarefa pendente {i}</span>
                  </div>
                ))}
                <div className="flex items-center p-4 bg-accent/20 opacity-60">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="ml-3 flex-grow line-through">Tarefa concluída com sucesso</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;