=import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estaCadastrando, setEstaCadastrando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function checarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('tarefas').select('*').eq('user_id', user.id);
        if (data) setTarefas(data);
      }
    }
    checarSessao();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return alert('Preencha todos os campos!');
    setCarregando(true);

    if (estaCadastrando) {
      const { error } = await supabase.auth.signUp({ email, senha });
      if (error) alert('Erro no cadastro: ' + error.message);
      else alert('Cadastro feito! Agora faça o login.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
      if (error) alert('Erro no login: ' + error.message);
      else if (data.user) {
        setUserId(data.user.id);
        const { data: tarefasBanco } = await supabase.from('tarefas').select('*').eq('user_id', data.user.id);
        if (tarefasBanco) setTarefas(tarefasBanco);
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
    }
  }

  async function alternarConcluido(id: number, statusAtual: boolean) {
    await supabase.from('tarefas').update({ concluido: !statusAtual }).eq('id', id);
    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: !statusAtual } : t));
  }

  // REQUISITO 3.1: EDITAR COM CONFIRMAÇÃO OBRIGATÓRIA
  async function editarTarefa(id: number, tituloAtual: string) {
    const certeza = window.confirm(`Tem certeza que deseja editar a tarefa "${tituloAtual}"?`);
    if (!certeza) return; 

    const novoTitulo = prompt('Digite o novo nome da tarefa:', tituloAtual);
    if (!novoTitulo || novoTitulo.trim() === '') return;

    const { error } = await supabase.from('tarefas').update({ titulo: novoTitulo }).eq('id', id);
    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, titulo: novoTitulo } : t));
    }
  }

  // REQUISITO 3.2: EXCLUIR COM CONFIRMAÇÃO OBRIGATÓRIA
  async function excluirTarefa(id: number, titulo: string) {
    const certeza = window.confirm(`Tem certeza que deseja excluir a tarefa "${titulo}"?`);
    if (!certeza) return;

    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    if (!error) {
      setTarefas(tarefas.filter(t => t.id !== id));
    }
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {!userId ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <form onSubmit={handleAuth} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
            <h2>{estaCadastrando ? 'Cadastro' : 'Login'}</h2>
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0052cc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {carregando ? 'Aguarde...' : estaCadastrando ? 'Cadastrar' : 'Entrar'}
            </button>
            <p onClick={() => setEstaCadastrando(!estaCadastrando)} style={{ textAlign: 'center', color: '#0052cc', cursor: 'pointer', marginTop: '15px', fontSize: '14px' }}>
              {estaCadastrando ? 'Já tem conta? Logar' : 'Não tem conta? Cadastrar'}
            </p>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
            <h3>Minhas Tarefas</h3>
            <button onClick={() => { supabase.auth.signOut(); setUserId(null); }} style={{ background: 'none', border: 'none', color: '#de350b', cursor: 'pointer' }}>Sair</button>
          </div>
          <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Olá! 👋</h2>
              <button onClick={adicionarTarefa} style={{ padding: '10px 20px', backgroundColor: '#0052cc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Nova Tarefa</button>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {tarefas.length === 0 ? <p>Nenhuma tarefa encontrada.</p> : tarefas.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="checkbox" checked={t.concluido} onChange={() => alternarConcluido(t.id, t.concluido)} />
                    <span style={{ textDecoration: t.concluido ? 'line-through' : 'none' }}>{t.titulo}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => editarTarefa(t.id, t.titulo)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => excluirTarefa(t.id, t.titulo)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}