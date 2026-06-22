import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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

  async function adicionarTarefa() {
    const tituloDigitado = prompt('Digite o nome da nova tarefa:');
    if (!tituloDigitado || !userId) return;

    const { data } = await supabase
      .from('tarefas')
      .insert([{ titulo: tituloDigitado, user_id: userId, concluido: false }])
      .select();

    if (data && data.length > 0) {
      setTarefas([...tarefas, data]);
    }
  }

  // REQUISITO 2: SOFT DELETE COM CONFIRMAÇÃO DO USUÁRIO
  async function aplicarSoftDelete(id: number) {
    const certeza = window.confirm("Tem certeza que deseja enviar esta tarefa para a lixeira (Soft Delete)?");
    if (!certeza) return;

    // Reaproveita a coluna 'concluido' como TRUE para marcar que foi para a lixeira
    const { error } = await supabase.from('tarefas').update({ concluido: true }).eq('id', id);
    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: true } : t));
    }
  }

  // REQUISITO 2: REVERTER O SOFT DELETE (RETORNAR PARA A LISTA ATIVA)
  async function reverterSoftDelete(id: number) {
    // Volta a coluna 'concluido' para FALSE (retorna para as ativas)
    const { error } = await supabase.from('tarefas').update({ concluido: false }).eq('id', id);
    if (!error) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, concluido: false } : t));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  // SEPARA AS TAREFAS EM DUAS LISTAS DIFERENTES NA TELA
  const tarefasAtivas = tarefas.filter(t => !t.concluido);
  const tarefasDeletadas = tarefas.filter(t => t.concluido);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'sans-serif', color: '#f8fafc' }}>
      {/* REQUISITO 1: NOVO ESTILO VISUAL E LAYOUT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#312e81', borderBottom: '2px solid #4338ca' }}>
        <h3 style={{ color: '#fff', margin: 0, letterSpacing: '1px' }}>🎯 Workspace ToDo - Infinity</h3>
        <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sair
        </button>
      </div>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#818cf8' }}>Painel de Tarefas IX</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Sistema com suporte a Soft Delete e Restauração.</p>
          </div>
          <button onClick={adicionarTarefa} style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            + Criar Tarefa
          </button>
        </div>

        {/* LISTA 1: TAREFAS ATIVAS */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#22c55e', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>📋 Tarefas Ativas</h3>
          {tarefasAtivas.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhuma tarefa ativa no momento.</p>
          ) : (
            tarefasAtivas.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: '16px' }}>{t.titulo}</span>
                <button onClick={() => aplicarSoftDelete(t.id)} style={{ padding: '6px 12px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  🗑️ Soft Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* LISTA 2: LIXEIRA (SOFT DELETE) */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>♻️ Lixeira (Tarefas Excluídas)</h3>
          {tarefasDeletadas.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center' }}>Lixeira vazia.</p>
          ) : (
            tarefasDeletadas.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', opacity: 0.7 }}>
                <span style={{ fontSize: '16px', textDecoration: 'line-through', color: '#94a3b8' }}>{t.titulo}</span>
                <button onClick={() => reverterSoftDelete(t.id)} style={{ padding: '6px 12px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🔄 Restaurar / Reverter
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}