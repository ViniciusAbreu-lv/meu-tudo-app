import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. CARREGA AS TAREFAS DO BANCO DE DADOS
  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('tarefas').select('*').eq('user_id', user.id);
        if (data) setTarefas(data);
      }
    }
    carregarDados();
  }, []);

  // 2. ADICIONA NOVA TAREFA
  async function adicionarTarefa() {
    const tituloDigitado = prompt('Digite o nome da nova tarefa:');
    if (!tituloDigitado || !userId) return;

    const { data, error } = await supabase
      .from('tarefas')
      .insert([{ titulo: tituloDigitado, user_id: userId, concluido: false }])
      .select();

    if (data && data.length > 0) {
      setTarefas([...tarefas, data]);
    } else if (error) {
      alert('Erro ao adicionar: ' + error.message);
    }
  }

  // 3. MARCAR COMO CONCLUÍDO (CHECKBOX)
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
    window.location.reload();
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* BARRA SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>Minhas Tarefas</h3>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          ➔ Sair
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        {/* TITULO CENTRAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Olá! 👋</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Gerencie suas tarefas reais do banco de dados.</p>
          </div>
          <button onClick={adicionarTarefa} style={{ padding: '12px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Nova Tarefa
          </button>
        </div>

        {/* LISTAGEM DE TAREFAS */}
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