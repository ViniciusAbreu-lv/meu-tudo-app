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
  Trash2,
  X
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
  const [mostrarInput, setMostrarInput] = useState(false);

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
      toast.error("Erro ao carregar: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarTarefas();
  }, [user]);

  const adicionarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !user) return;

    setEnviando(true);
    try {
      const { error } = await supabase
        .from('tarefas')
        .insert([{ 
          titulo: novoTitulo, 
          user_id: user.id, 
          concluido: false 
        }]);

      if (error) throw error;

      setNovoTitulo('');
      setMostrarInput(false);
      toast.success("Tarefa adicionada!");
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
      // Atualização otimista para ser instantâneo na UI
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluido: !estadoAtual } : t));
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
      buscarTarefas(); // Reverte em caso de erro
    }
  };

  const excluirTarefa = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTarefas(prev => prev.filter(t => t.id !== id));
      toast.success("Tarefa removida");
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">Minhas Tarefas</h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="rounded-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="space-y-6">
          {/* Botão para abrir campo ou o próprio campo */}
          {!mostrarInput ? (
            <Button 
              onClick={() => setMostrarInput(true)}
              className="w-full h-16 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-lg transition-all"
              variant="outline"
            >
              <Plus className="mr-2 h-6 w-6" /> Nova Tarefa
            </Button>
          ) : (
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden ring-2 ring-primary/20">
              <CardContent className="p-6">
                <form onSubmit={adicionarTarefa} className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    autoFocus
                    placeholder="O que você vai realizar hoje?" 
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    className="rounded-2xl h-12 bg-background border-none shadow-inner text-lg"
                    disabled={enviando}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-grow sm:flex-none rounded-2xl h-12 px-8" disabled={enviando || !novoTitulo.trim()}>
                      {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setMostrarInput(false)}
                      className="rounded-2xl h-12 w-12 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Tarefas */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 px-8 py-6">
              <CardTitle className="text-xl font-bold">Lista de Afazeres</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {carregando ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
                  <p className="font-medium">Sincronizando com a nuvem...</p>
                </div>
              ) : tarefas.length === 0 ? (
                <div className="text-center py-24 px-8">
                  <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-xl font-semibold text-muted-foreground">Tudo limpo por aqui!</p>
                  <p className="text-muted-foreground mt-2">Suas tarefas aparecerão aqui assim que você as criar.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {tarefas.map((tarefa) => (
                    <div 
                      key={tarefa.id} 
                      className={`flex items-center px-8 py-5 hover:bg-primary/5 transition-all group ${tarefa.concluido ? 'bg-muted/10' : ''}`}
                    >
                      <button 
                        onClick={() => alternarConcluido(tarefa.id, tarefa.concluido)}
                        className={`flex-shrink-0 rounded-full transition-all duration-300 ${tarefa.concluido ? 'text-green-500 scale-110' : 'text-muted-foreground hover:text-primary hover:scale-110'}`}
                      >
                        {tarefa.concluido ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                      </button>
                      
                      <span className={`ml-4 flex-grow text-lg font-medium transition-all duration-500 ${tarefa.concluido ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
                        {tarefa.titulo}
                      </span>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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