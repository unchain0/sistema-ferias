'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Professional, VacationPeriod } from '@/types';
import { formatCurrency, computeConcessivePeriod, formatDateToPtBR } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Calendar, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { handleDemoError } from '@/lib/handle-demo-error';

export default function VacationsPage() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@sistema-ferias.com';
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    professionalId: '',
    acquisitionStartDate: '',
    acquisitionEndDate: '',
    usageStartDate: '',
    usageEndDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vacationsRes, professionalsRes] = await Promise.all([
        fetch('/api/vacations?order=createdAt:desc&limit=50'),
        fetch('/api/professionals'),
      ]);

      if (vacationsRes.ok && professionalsRes.ok) {
        const vacationsData = await vacationsRes.json();
        const professionalsData = await professionalsRes.json();
        setVacations(vacationsData);
        setProfessionals(professionalsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingId
        ? `/api/vacations/${editingId}`
        : '/api/vacations';
      
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
        await fetchData();
        resetForm();
      } else {
        setError(data.error || 'Erro ao salvar período de férias');
      }
    } catch (error) {
      console.error('Error saving vacation:', error);
      setError('Erro ao salvar período de férias');
    }
  };

  const handleEdit = (vacation: VacationPeriod) => {
    setFormData({
      professionalId: vacation.professionalId,
      acquisitionStartDate: vacation.acquisitionStartDate,
      acquisitionEndDate: vacation.acquisitionEndDate,
      usageStartDate: vacation.usageStartDate,
      usageEndDate: vacation.usageEndDate,
    });
    setEditingId(vacation.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este período de férias?')) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/vacations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      const demoError = handleDemoError(response, data);

      if (demoError) {
        setError(demoError);
        return;
      }

      if (response.ok) {
        await fetchData();
      } else {
        setError(data.error || 'Erro ao excluir período de férias');
      }
    } catch (error) {
      console.error('Error deleting vacation:', error);
      setError('Erro ao excluir período de férias');
    }
  };

  const resetForm = () => {
    setFormData({
      professionalId: '',
      acquisitionStartDate: '',
      acquisitionEndDate: '',
      usageStartDate: '',
      usageEndDate: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getProfessionalName = (id: string) => {
    const professional = professionals.find(p => p.id === id);
    return professional?.name || 'Desconhecido';
  };

  // Note: do not short-circuit on loading to prevent large layout swaps (CLS)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Períodos de Férias
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os períodos aquisitivos e de gozo de férias
            </p>
          </div>
          
          {!showForm && professionals.length > 0 && (
            <Button 
              onClick={() => setShowForm(true)}
              disabled={isDemo || loading}
              className="flex flex-row items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">Novo Período</span>
            </Button>
          )}
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

        {professionals.length === 0 && !loading && (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum profissional cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cadastre profissionais antes de adicionar períodos de férias
              </p>
            </div>
          </Card>
        )}

        {/* Form */}
        {showForm && professionals.length > 0 && !isDemo && (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Período de Férias' : 'Novo Período de Férias'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Profissional
                </label>
                <select
                  value={formData.professionalId}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Início Período Aquisitivo"
                  type="date"
                  value={formData.acquisitionStartDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionStartDate: e.target.value })}
                  required
                />

                <Input
                  label="Fim Período Aquisitivo"
                  type="date"
                  value={formData.acquisitionEndDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionEndDate: e.target.value })}
                  required
                />
              </div>

              {(formData.acquisitionStartDate && formData.acquisitionEndDate) && (() => {
                const concessivePeriod = computeConcessivePeriod(formData.acquisitionStartDate, formData.acquisitionEndDate);
                return (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Período Concessivo: </span>
                    {formatDateToPtBR(concessivePeriod.start)}
                    {" "}até{" "}
                    {formatDateToPtBR(concessivePeriod.end)}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Início Período de Gozo"
                  type="date"
                  value={formData.usageStartDate}
                  onChange={(e) => setFormData({ ...formData, usageStartDate: e.target.value })}
                  required
                />

                <Input
                  label="Fim Período de Gozo"
                  type="date"
                  value={formData.usageEndDate}
                  onChange={(e) => setFormData({ ...formData, usageEndDate: e.target.value })}
                  required
                />
              </div>

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

        {/* Vacations List */}
        {professionals.length > 0 && vacations.length === 0 && !showForm && !loading && (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum período de férias cadastrado
              </p>
            </div>
          </Card>
        )}

        {/* Skeleton list during initial load to preserve layout height */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={`skeleton-${i}`}>
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && vacations.length > 0 && (
          <div className="space-y-4">
            {vacations.map((vacation) => (
              <Card key={vacation.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {getProfessionalName(vacation.professionalId)}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Período Aquisitivo
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateToPtBR(vacation.acquisitionStartDate)} até{' '}
                          {formatDateToPtBR(vacation.acquisitionEndDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Período de Gozo
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateToPtBR(vacation.usageStartDate)} até{' '}
                          {formatDateToPtBR(vacation.usageEndDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Período Concessivo
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {(() => {
                            const concessivePeriod = computeConcessivePeriod(vacation.acquisitionStartDate, vacation.acquisitionEndDate);
                            return `${formatDateToPtBR(concessivePeriod.start)} até ${formatDateToPtBR(concessivePeriod.end)}`;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Total de Dias:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {vacation.totalDays} dias
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Abatimento:
                        </span>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(vacation.revenueDeduction)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(vacation)}
                      disabled={isDemo}
                      className="flex-1 md:flex-none md:w-28 flex flex-row justify-center items-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="ml-2 font-medium">Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(vacation.id)}
                      disabled={isDemo}
                      className="flex-1 md:flex-none md:w-28 flex flex-row justify-center items-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
