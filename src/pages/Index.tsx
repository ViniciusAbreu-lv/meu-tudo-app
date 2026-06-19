import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Edit2, LogOut, CheckCircle2, Circle, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estaCadastrando, setEstaCadastrando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoTarefas, setCarregandoTarefas] = useState(true);

  useEffect(() => {
    checarSessao();
  }, []);

  async function checarSessao() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      buscarTarefas(user.id);
    } else {
      setCarregandoTarefas(false);
    }
  }

  async function buscarTarefas(idDoUsuario: string) {
    setCarregandoTarefas(true);
    const { data } = await supabase.from('tarefas').select('*').eq('user_id', idDoUsuario);
    if (data) setTarefas(data);
    setCarregandoTarefas(false);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return toast.error('Preencha os campos!');
    setCarregando(true);

    if (estaCadastrando) {
      const { error } = await supabase.auth.signUp({ email, senha });
      if (error) toast.error(error.message);
      else toast.success('Cadastrado com sucesso!');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
      if (error) toast.error(error.message);
      else if (data.user) {
        setUserId(data.user.id);
        buscarTarefas(data.user.id);
      }
    }
    setCarregando(false);
  }

  async function adicionarTarefa() {
    const tituloDigitado = prompt('Digite o nome da nova tarefa:');
    if (!tituloDigitado || !userId) return;

    const { data } = await supabase
      .from('tarefas')
      .insert([{ titulo: tituloDigitado, user_id: userId, concluido: false }])
      .select();

    if (data && data.length > 0) {
      setTarefas([...tarefas, data[0]]);
      toast.success('Tarefa adicionada!');
    }
  }

  async function alternarConcluido(id: number, statusAtual: boolean) {
    await supabase.from('tarefas').update({ concluido: !statusAtual }).eq('id', id);
    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: !statusAtual } : t));
  }

  // REQUISITO 3.1: EDITAR COM CONFIRMAÇÃO DIRETA
  const editarTarefa = async (id: number, tituloAtual: string) => {
    const certeza = window.confirm(`Tem certeza que deseja editar a tarefa "${tituloAtual}"?`);
    if (!certeza) return;

    const novoTitulo = prompt("Digite o novo nome da tarefa:", tituloAtual);
    if (!novoTitulo || novoTitulo.trim() === "") return;

    const { error } = await supabase.from('tarefas').update({ titulo: novoTitulo }).eq('id', id);
    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, titulo: novoTitulo } : t));
      toast.success("Tarefa editada!");
    }
  }

  // REQUISITO 3.2: EXCLUIR COM CONFIRMAÇÃO DIRETA
  const excluirTarefa = async (id: number) => {
    const certeza = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    if (!certeza) return;

    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (!error) {
      setTarefas(tarefas.filter(t => t.id !== id));
      toast.success("Tarefa excluída!");
    }
  }

  if (!userId) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleAuth} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '320px' }}>
          <h2>{estaCadastrando ? 'Cadastro' : 'Login'}</h2>
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {carregando ? 'Carregando...' : estaCadastrando ? 'Cadastrar' : 'Entrar'}
          </button>
          <p onClick={() => setEstaCadastrando(!estaCadastrando)} style={{ textAlign: 'center', color: '#2563eb', cursor: 'pointer', marginTop: '15px', fontSize: '14px' }}>
            {estaCadastrando ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <h3>Minhas Tarefas</h3>
        <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>➔ Sair</button>
      </div>
      
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
          <h2>Olá! 👋</h2>
          <button onClick={adicionarTarefa} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Nova Tarefa</button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {carregandoTarefas ? (
            <p style={{ textLight: 'center' }}>Carregando dados reais...</p>
          ) : tarefas.length === 0 ? (
            <p style={{ textLight: 'center' }}>Nenhuma tarefa encontrada.</p>
          ) : (
            tarefas.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="checkbox" checked={t.concluido} onChange={() => alternarConcluido(t.id, t.concluido)} />
                  <span style={{ textDecoration: t.concluido ? 'line-through' : 'none', color: t.concluido ? '#94a3b8' : '#334155' }}>{t.titulo}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => editarTarefa(t.id, t.titulo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
                  <button onClick={() => excluirTarefa(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}