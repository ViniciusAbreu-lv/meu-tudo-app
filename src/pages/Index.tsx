"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit2, Rocket, LogOut, Plus, CheckCircle2, Circle, Loader2, Trash2, X } from 'lucide-react';
import Layout from '@/components/Layout';

interface Tarefa {
  id: number;
  titulo: string;
  concluido: boolean;
  user_id: string;
}

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados das Tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [carregandoTarefas, setCarregandoTarefas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarInput, setMostrarInput] = useState(false);

  // --- Lógica de Auth ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Verifique seu e-mail para confirmar o cadastro!");
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Bem-vindo!");
    setLoading(false);
  };

  // --- Lógica de Tarefas ---
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
      toast.error("Erro ao carregar tarefas: " + error.message);
    } finally {
      setCarregandoTarefas(false);
    }
  };

  useEffect(() => {
    if (user) buscarTarefas();
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
      toast.success("Tarefa salva!");
      buscarTarefas();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
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
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluido: !estadoAtual } : t));
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
    }
  };

  const excluirTarefa = async (id: number) => {
    try {
      const certeza = window.confirm("Tem certeza que deseja excluir esta tarefa?");
if (!certeza) return;
      const { error } = await supabase.from('tarefas').delete().eq('id', id);
      if (error) throw error;
      setTarefas(prev => prev.filter(t => t.id !== id));
      toast.success("Removida");
    } catch (error: any) {
      toast.error("Erro ao excluir");

      const editarTarefa = async (id: number, tituloAtual: string) => {
  const certeza = window.confirm(`Tem certeza que deseja editar a tarefa "${tituloAtual}"?`);
  if (!certeza) return;

  const novoTitulo = prompt("Digite o novo nome da tarefa:", tituloAtual);
  if (!novoTitulo || novoTitulo.trim() === "") return;

  try {
    const { error } = await supabase.from('tarefas').update({ titulo: novoTitulo }).eq('id', id);
    if (error) throw error;
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, titulo: novoTitulo } : t));
    toast.success("Editada com sucesso!");
  } catch (error) {
    toast.error("Erro ao editar");
  }
};
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD (LOGADO) ---
  if (user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-primary">Minhas Tarefas</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
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
                    <p className="text-muted-foreground">Carregando dados reais...</p>
                  </div>
                ) : tarefas.length === 0 ? (
                  <div className="text-center py-24 px-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">Nenhuma tarefa encontrada.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {tarefas.map((t) => (
                      <div key={t.id} className="flex items-center px-8 py-5 hover:bg-primary/5 group">
                        <button 
                          onClick={() => alternarConcluido(t.id, t.concluido)}
                          className={`transition-all ${t.concluido ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          {t.concluido ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                        </button>
                        <span className={`ml-4 flex-grow text-lg ${t.concluido ? 'line-through text-muted-foreground/60' : ''}`}>
                          {t.titulo}
                        </span>
                       
                        <Button 
                          variant="ghost" size="icon" 
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={() => excluirTarefa(t.id)}
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
  }

  // --- RENDERIZAÇÃO DE AUTH (NÃO LOGADO) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex bg-primary p-3 rounded-2xl mb-4">
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VigilantApp</h1>
          <p className="text-muted-foreground mt-2">Sua central de produtividade segura</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>Acesse sua conta para gerenciar suas tarefas.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full h-12" type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-none shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>Comece a organizar sua rotina agora mesmo.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">E-mail</Label>
                    <Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full h-12" type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Cadastrar"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;