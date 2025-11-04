'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Professional } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, AlertCircle, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { handleDemoError } from '@/lib/handle-demo-error';

export default function ProfessionalsPage() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@sistema-ferias.com';
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    clientManager: '',
    monthlyRevenue: '',
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals');
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingId
        ? `/api/professionals/${editingId}`
        : '/api/professionals';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      const demoError = handleDemoError(response, data);

      if (demoError) {
        setError(demoError);
        return;
      }

      if (response.ok) {
        await fetchProfessionals();
        resetForm();
      } else {
        setError(data.error || 'Erro ao salvar profissional');
      }
    } catch (error) {
      console.error('Error saving professional:', error);
      setError('Erro ao salvar profissional');
    }
  };

  const handleEdit = (professional: Professional) => {
    setFormData({
      name: professional.name,
      clientManager: professional.clientManager,
      monthlyRevenue: professional.monthlyRevenue.toString(),
    });
    setEditingId(professional.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/professionals/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      const demoError = handleDemoError(response, data);

      if (demoError) {
        setError(demoError);
        return;
      }

      if (response.ok) {
        await fetchProfessionals();
      } else {
        setError(data.error || 'Erro ao excluir profissional');
      }
    } catch (error) {
      console.error('Error deleting professional:', error);
      setError('Erro ao excluir profissional');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientManager: '',
      monthlyRevenue: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const query = searchQuery.toLowerCase();
    return (
      professional.name.toLowerCase().includes(query) ||
      professional.clientManager.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profissionais
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gerencie os profissionais e seus faturamentos
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou gestor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                disabled={isDemo}
                className="flex flex-row items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">Novo Profissional</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Atenção
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && !isDemo && (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome do Profissional"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="João Silva"
                required
              />

              <Input
                label="Gestor no Cliente"
                value={formData.clientManager}
                onChange={(e) => setFormData({ ...formData, clientManager: e.target.value })}
                placeholder="Maria Santos"
                required
              />

              <Input
                label="Faturamento Mensal (R$)"
                type="number"
                step="0.01"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                placeholder="15000.00"
                required
              />

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Professionals List */}
        {professionals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum profissional cadastrado
              </p>
            </div>
          </Card>
        ) : filteredProfessionals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum profissional encontrado para &quot;{searchQuery}&quot;
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id}>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gestor: {professional.clientManager}
                    </p>
                  </div>

                  <div className="pt-3 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Faturamento Mensal
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(professional.monthlyRevenue)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(professional)}
                      disabled={isDemo}
                      className="flex-1 flex flex-row justify-center items-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="ml-2 font-medium">Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(professional.id)}
                      disabled={isDemo}
                      className="flex-1 flex flex-row justify-center items-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="ml-2 font-medium">Excluir</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
