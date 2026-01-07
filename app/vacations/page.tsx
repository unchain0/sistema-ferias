'use client';

import { AlertCircle, Edit2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createVacation, deleteVacation, updateVacation } from '@/app/actions/vacations';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  computeConcessivePeriod,
  formatCurrency,
  formatDateForInput,
  formatDateToPtBR,
} from '@/lib/utils';
import { Professional, VacationPeriod } from '@/types';

export default function VacationsPage() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@sistema-ferias.com';
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const [searchQuery, setSearchQuery] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && searchQuery === '') {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, searchQuery],
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    professionalId: '',
    acquisitionStartDate: null as Date | null,
    acquisitionEndDate: null as Date | null,
    usageStartDate: null as Date | null,
    usageEndDate: null as Date | null,
  });

  useEffect(() => {
    if (page === 0) {
      fetchData();
    } else {
      loadMoreVacations();
    }
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vacationsRes, professionalsRes] = await Promise.all([
        fetch(`/api/vacations?order=createdAt:desc&limit=${PAGE_SIZE}&offset=0`),
        fetch('/api/professionals'),
      ]);

      if (vacationsRes.ok && professionalsRes.ok) {
        const vacationsData = await vacationsRes.json();
        const professionalsData = await professionalsRes.json();
        setVacations(vacationsData);
        setProfessionals(professionalsData);
        setHasMore(vacationsData.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVacations = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/vacations?order=createdAt:desc&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      );
      if (response.ok) {
        const data = await response.json();
        setVacations((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error loading more vacations:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchAllForSearch = async () => {
    try {
      const response = await fetch('/api/vacations?order=createdAt:desc');
      if (response.ok) {
        const data = await response.json();
        setVacations(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching all vacations for search:', error);
    }
  };

  useEffect(() => {
    if (searchQuery !== '') {
      fetchAllForSearch();
    } else if (page === 0) {
      fetchData();
    }
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação dos campos obrigatórios
    if (!formData.professionalId) {
      setError('Por favor, selecione um profissional.');
      return;
    }
    if (
      !formData.acquisitionStartDate ||
      !formData.acquisitionEndDate ||
      !formData.usageStartDate ||
      !formData.usageEndDate
    ) {
      setError('Por favor, preencha todas as datas.');
      return;
    }

    // Converter datas para string no formato adequado
    const formattedData = {
      professionalId: formData.professionalId,
      acquisitionStartDate: formData.acquisitionStartDate
        ? formatDateForInput(formData.acquisitionStartDate)
        : '',
      acquisitionEndDate: formData.acquisitionEndDate
        ? formatDateForInput(formData.acquisitionEndDate)
        : '',
      usageStartDate: formData.usageStartDate ? formatDateForInput(formData.usageStartDate) : '',
      usageEndDate: formData.usageEndDate ? formatDateForInput(formData.usageEndDate) : '',
    };

    try {
      let result;
      if (editingId) {
        result = await updateVacation(editingId, formattedData);
      } else {
        result = await createVacation(formattedData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      setPage(0);
      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving vacation:', error);
      setError('Erro ao salvar período de férias');
    }
  };

  const handleEdit = (vacation: VacationPeriod) => {
    setFormData({
      professionalId: vacation.professionalId,
      acquisitionStartDate: vacation.acquisitionStartDate
        ? new Date(vacation.acquisitionStartDate)
        : null,
      acquisitionEndDate: vacation.acquisitionEndDate
        ? new Date(vacation.acquisitionEndDate)
        : null,
      usageStartDate: vacation.usageStartDate ? new Date(vacation.usageStartDate) : null,
      usageEndDate: vacation.usageEndDate ? new Date(vacation.usageEndDate) : null,
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
      const result = await deleteVacation(id);

      if (result.error) {
        setError(result.error);
        return;
      }

      setPage(0);
      await fetchData();
    } catch (error) {
      console.error('Error deleting vacation:', error);
      setError('Erro ao excluir período de férias');
    }
  };

  const resetForm = () => {
    setFormData({
      professionalId: '',
      acquisitionStartDate: null,
      acquisitionEndDate: null,
      usageStartDate: null,
      usageEndDate: null,
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getProfessionalName = (id: string) => {
    const professional = professionals.find((p) => p.id === id);
    return professional?.name || 'Desconhecido';
  };

  const filteredVacations = useMemo(() => {
    return vacations.filter((vacation) => {
      const query = searchQuery.toLowerCase();
      const professional = professionals.find((p) => p.id === vacation.professionalId);
      const professionalName = (professional?.name || 'Desconhecido').toLowerCase();
      return professionalName.includes(query);
    });
  }, [vacations, searchQuery, professionals]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Períodos de Férias
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gerencie os períodos aquisitivos e de gozo de férias
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome do profissional..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                disabled={isDemo || loading}
                className="flex flex-row items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">Novo Período</span>
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

        {/* Empty state when no professionals */}
        {professionals.length === 0 && !loading && (
          <EmptyState
            icon="calendar"
            title="Nenhum profissional cadastrado"
            description="Cadastre profissionais para poder gerenciar seus períodos de férias"
          />
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
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Início Período Aquisitivo
                  </label>
                  <SingleDatePicker
                    date={formData.acquisitionStartDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, acquisitionStartDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Fim Período Aquisitivo
                  </label>
                  <SingleDatePicker
                    date={formData.acquisitionEndDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, acquisitionEndDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={false}
                  />
                </div>
              </div>

              {formData.acquisitionStartDate &&
                formData.acquisitionEndDate &&
                (() => {
                  const concessivePeriod = computeConcessivePeriod(
                    formData.acquisitionStartDate.toISOString().split('T')[0],
                    formData.acquisitionEndDate.toISOString().split('T')[0],
                  );
                  return (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Período Concessivo: </span>
                      {formatDateToPtBR(concessivePeriod.start)} até{' '}
                      {formatDateToPtBR(concessivePeriod.end)}
                    </div>
                  );
                })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Início Período de Gozo
                  </label>
                  <SingleDatePicker
                    date={formData.usageStartDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, usageStartDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Fim Período de Gozo
                  </label>
                  <SingleDatePicker
                    date={formData.usageEndDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, usageEndDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={false}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">{editingId ? 'Atualizar' : 'Criar'}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={`skeleton-${i}`}>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Vacations List */}
        {!loading && professionals.length > 0 && vacations.length === 0 && !showForm && (
          <EmptyState
            icon="calendar"
            title="Nenhum período de férias registrado"
            description="Adicione períodos de férias para gerenciar os períodos aquisitivos e de gozo"
          />
        )}

        {!loading && vacations.length > 0 && filteredVacations.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum período de férias encontrado para &quot;{searchQuery}&quot;
              </p>
            </div>
          </Card>
        )}

        {!loading && filteredVacations.length > 0 && (
          <div className="space-y-4">
            {filteredVacations.map((vacation, index) => (
              <div
                key={vacation.id}
                ref={index === filteredVacations.length - 1 ? lastElementRef : null}
              >
                <Card>
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
                              const concessivePeriod = computeConcessivePeriod(
                                vacation.acquisitionStartDate,
                                vacation.acquisitionEndDate,
                              );
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
                        variant="destructive"
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
              </div>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
