"use client";

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Trash2 
} from 'lucide-react';
import { toast } from "sonner";

interface Tarefa {
  id: number;
  titulo: string;
  concluido: boolean;
  user_id: string;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // 1. Buscar tarefas filtradas pelo usuário logado (Requisito 3.a)
  const buscarTarefas = async () => {
    if (!user) return;
    
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false });

      if (error) throw error;
      setTarefas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tarefas: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarTarefas();
  }, [user]);

  // 2. Criação de tarefas (Requisito 3.b)
  const adicionarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !user) return;

    setEnviando(true);
    try {
      const { error } = await supabase
        .from('tarefas')
        .insert([
          { 
            titulo: novoTitulo, 
            user_id: user.id, // ID do usuário logado
            concluido: false 
          }
        ]);

      if (error) throw error;

      setNovoTitulo('');
      toast.success("Tarefa adicionada!");
      // 3. Atualização da Home (Requisito 4)
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao adicionar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  const alternarConcluido = async (id: number, estadoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ concluido: !estadoAtual })
        .eq('id', id);

      if (error) throw error;
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    }
  };

  const excluirTarefa = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Tarefa removida");
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
            <p className="text-muted-foreground">Conectado como: {user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Formulário de Nova Tarefa */}
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-primary/5">
            <CardContent className="p-6">
              <form onSubmit={adicionarTarefa} className="flex gap-3">
                <Input 
                  placeholder="O que precisa ser feito?" 
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="rounded-2xl h-12 bg-background border-none shadow-inner"
                  disabled={enviando}
                />
                <Button type="submit" className="rounded-2xl h-12 px-6" disabled={enviando || !novoTitulo.trim()}>
                  {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  <span className="ml-2 hidden sm:inline">Adicionar</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-lg font-semibold">Lista de Afazeres</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {carregando ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p>Carregando suas tarefas...</p>
                </div>
              ) : tarefas.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-lg">Nenhuma tarefa encontrada.</p>
                  <p className="text-sm">Comece adicionando algo acima!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tarefas.map((tarefa) => (
                    <div 
                      key={tarefa.id} 
                      className={`flex items-center p-4 hover:bg-accent/40 transition-all group ${tarefa.concluido ? 'bg-muted/20' : ''}`}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`rounded-full transition-colors ${tarefa.concluido ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => alternarConcluido(tarefa.id, tarefa.concluido)}
                      >
                        {tarefa.concluido ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                      </Button>
                      
                      <span className={`ml-3 flex-grow font-medium transition-all ${tarefa.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {tarefa.titulo}
                      </span>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        onClick={() => excluirTarefa(tarefa.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;