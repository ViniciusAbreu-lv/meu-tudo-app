"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Plus, CheckCircle2, Circle, Loader2, Trash2, Pencil, X } from 'lucide-react';
import Layout from '@/components/Layout';

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
  const [carregandoTarefas, setCarregandoTarefas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarInput, setMostrarInput] = useState(false);

  const buscarTarefas = async () => {
    if (!user) return;
    setCarregandoTarefas(true);
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false });
      if (error) throw error;
      setTarefas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tarefas");
    } finally {
      setCarregandoTarefas(false);
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
        .insert([{ titulo: novoTitulo, user_id: user.id, concluido: false }]);
      if (error) throw error;
      setNovoTitulo('');
      setMostrarInput(false);
      toast.success("Tarefa adicionada!");
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao salvar tarefa");
    } finally {
      setEnviando(false);
    }
  };

  const editarTarefa = async (id: number, tituloAtual: string) => {
    const certeza = window.confirm(`Tem certeza que deseja editar a tarefa "${tituloAtual}"?`);
    if (!certeza) return;

    const novoNome = window.prompt("Digite o novo nome da tarefa:", tituloAtual);
    if (!novoNome || novoNome.trim() === "" || novoNome === tituloAtual) return;

    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ titulo: novoNome })
        .eq('id', id);
      if (error) throw error;
      toast.success("Tarefa atualizada!");
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao editar tarefa");
    }
  };

  const excluirTarefa = async (id: number) => {
    const certeza = window.confirm("Tem certeza que deseja excluir esta tarefa permanentemente?");
    if (!certeza) return;

    try {
      const { error } = await supabase.from('tarefas').delete().eq('id', id);
      if (error) throw error;
      toast.success("Tarefa removida!");
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao excluir tarefa");
    }
  };

  const alternarConcluido = async (id: number, estadoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ concluido: !estadoAtual })
        .eq('id', id);
      if (error) throw error;
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluido: !estadoAtual } : t));
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">Minhas Tarefas</h1>
            <p className="text-muted-foreground mt-1">Organize seu dia com eficiência</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <div className="space-y-6">
          {!mostrarInput ? (
            <Button 
              onClick={() => setMostrarInput(true)}
              className="w-full h-16 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-lg"
              variant="outline"
            >
              <Plus className="mr-2 h-6 w-6" /> Nova Tarefa
            </Button>
          ) : (
            <Card className="border-none shadow-2xl rounded-3xl ring-2 ring-primary/20">
              <CardContent className="p-6">
                <form onSubmit={adicionarTarefa} className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    autoFocus
                    placeholder="O que vamos fazer hoje?" 
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    className="rounded-2xl h-12 text-lg"
                    disabled={enviando}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="rounded-2xl h-12 px-8" disabled={enviando || !novoTitulo.trim()}>
                      {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setMostrarInput(false)} className="rounded-2xl h-12 w-12">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 px-8 py-6">
              <CardTitle className="text-xl font-bold">Lista de Afazeres</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {carregandoTarefas ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-4" />
                  <p className="text-muted-foreground">Sincronizando com o banco de dados...</p>
                </div>
              ) : tarefas.length === 0 ? (
                <div className="text-center py-24 px-8">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground">Tudo limpo por aqui!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {tarefas.map((t) => (
                    <div key={t.id} className="flex items-center px-8 py-5 hover:bg-primary/5 group transition-colors">
                      <button 
                        onClick={() => alternarConcluido(t.id, t.concluido)}
                        className={`transition-all ${t.concluido ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        {t.concluido ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                      </button>
                      <span className={`ml-4 flex-grow text-lg ${t.concluido ? 'line-through text-muted-foreground/60' : ''}`}>
                        {t.titulo}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" size="icon" 
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => editarTarefa(t.id, t.titulo)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => excluirTarefa(t.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
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