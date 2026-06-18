import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estaCadastrando, setEstaCadastrando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // 1. VERIFICA SE O USUÁRIO JÁ ESTÁ LOGADO
  useEffect(() => {
    async function checarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        carregarTarefas(user.id);
      }
    }
    checarSessao();
  }, []);

  // 2. CARREGA AS TAREFAS DO BANCO
  async function carregarTarefas(idDoUsuario: string) {
    const { data } = await supabase.from('tarefas').select('*').eq('user_id', idDoUsuario);
    if (data) setTarefas(data);
  }

  // 3. FLUXO DE LOGIN E CADASTRO
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return alert('Preencha todos os campos!');
    setCarregando(true);

    if (estaCadastrando) {
      const { data, error } = await supabase.auth.signUp({ email, senha });
      if (error) alert('Erro no cadastro: ' + error.message);
      else {
        alert('Cadastro realizado com sucesso! Fazendo login...');
        if (data.user) {
          setUserId(data.user.id);
          carregarTarefas(data.user.id);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
      if (error) alert('Erro no login: ' + error.message);
      else if (data.user) {
        setUserId(data.user.id);
        carregarTarefas(data.user.id);
      }
    }
    setCarregando(false);
  }

  // 4. ADICIONA NOVA TAREFA
  async function adicionarTarefa() {
    const tituloDigitado = prompt('Digite o nome da nova tarefa:');
    if (!tituloDigitado || !userId) return;

    const { data, error } = await supabase
      .from('tarefas')
      .insert([{ titulo: tituloDigitado, user_id: userId, concluido: false }])
      .select();

    if (data && data.length > 0) {
      setTarefas([...tarefas, data[0]]);
    } else if (error) {
      alert('Erro ao adicionar: ' + error.message);
    }
  }

  // 5. MARCAR COMO CONCLUÍDO (CHECKBOX)
  async function alternarConcluido(id: number, statusAtual: boolean) {
    const { error } = await supabase
      .from('tarefas')
      .update({ concluido: !statusAtual })
      .eq('id', id);

    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: !statusAtual } : t));
    }
  }

  // REQUISITO 3.1: EDITAR COM CONFIRMAÇÃO OBRIGATÓRIA
  async function editarTarefa(id: number, tituloAtual: string) {
    const certeza = window.confirm(`Tem certeza que deseja editar a tarefa "${tituloAtual}"?`);
    if (!certeza) return; 

    const novoTitulo = prompt('Digite o novo nome da tarefa:', tituloAtual);
    if (!novoTitulo || novoTitulo.trim() === '') return;

    const { error } = await supabase
      .from('tarefas')
      .update({ titulo: novoTitulo })
      .eq('id', id);

    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, titulo: novoTitulo } : t));
    } else {
      alert('Erro ao editar: ' + error.message);
    }
  }

  // REQUISITO 3.2: EXCLUIR COM CONFIRMAÇÃO OBRIGATÓRIA
  async function excluirTarefa(id: number, titulo: string) {
    const certeza = window.confirm(`Tem certeza que deseja excluir a tarefa "${titulo}"?`);
    if (!certeza) return;

    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);

    if (!error) {
      setTarefas(tarefas.filter(t => t.id !== id));
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserId(null);
    setTarefas([]);
    setEmail('');
    setSenha('');
  }

  // TELA DE LOGIN / CADASTRO (CASO NÃO ESTEJA LOGADO)
  if (!userId) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '24px' }}>
            {estaCadastrando ? 'Criar uma conta' : 'Entrar no DyadApp'}
          </h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDir: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontWeight: 'bold', fontSize: '14px' }}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontWeight: 'bold', fontSize: '14px' }}>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <button type="submit" disabled={carregando} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {carregando ? 'Carregando...' : estaCadastrando ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            {estaCadastrando ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <span onClick={() => setEstaCadastrando(!estaCadastrando)} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
              {estaCadastrando ? 'Faça login' : 'Cadastre-se'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // TELA DE TAREFAS REAL (APARECE APÓS O LOGIN)
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>Minhas Tarefas</h3>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ➔ Sair
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Olá! 👋</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Gerencie suas tarefas reais do banco de dados.</p>
          </div>
          <button onClick={adicionarTarefa} style={{ padding: '12px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Nova Tarefa
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '10px 20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {tarefas.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>Nenhuma tarefa encontrada. Adicione uma acima!</p>
          ) : (
            tarefas.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" checked={t.concluido} onChange={() => alternarConcluido(t.id, t.concluido)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <span style={{ color: t.concluido ? '#94a3b8' : '#334155', textDecoration: t.concluido ? 'line-through' : 'none', fontSize: '16px' }}>
                    {t.titulo}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={() => editarTarefa(t.id, t.titulo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Editar">
                    ✏️
                  </button>
                  <button onClick={() => excluirTarefa(t.id, t.titulo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}