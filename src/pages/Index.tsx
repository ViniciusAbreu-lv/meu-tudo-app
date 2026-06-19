"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário já estiver logado, redireciona para a Home de tarefas
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Caso contrário, mostra a tela de Auth
  return <Auth />;
};

export default Index;