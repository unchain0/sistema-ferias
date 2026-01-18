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
import { DEMO_USER_EMAIL } from '@/lib/constants';
import {
  computeConcessivePeriod,
  formatCurrency,
  formatDateForInput,
  formatDateToPtBR,
} from '@/lib/utils';
import { Professional, VacationPeriod } from '@/types';

/**
 * Custom hook for debouncing a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function VacationsPage() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === DEMO_USER_EMAIL;
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const [searchQuery, setSearchQuery] = useState('');
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Form submission state for preventing double-submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && debouncedSearchQuery === '') {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, debouncedSearchQuery],
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

  // Create a Map for O(1) professional name lookups
  const professionalNameMap = useMemo(
    () => new Map(professionals.map((p) => [p.id, p.name])),
    [professionals],
  );

  const getProfessionalName = useCallback(
    (id: string) => professionalNameMap.get(id) || 'Desconhecido',
    [professionalNameMap],
  );

  // Fetch vacations with pagination
  const fetchVacations = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const offset = pageNum * PAGE_SIZE;
      const response = await fetch(
        `/api/vacations?order=createdAt:desc&limit=${PAGE_SIZE}&offset=${offset}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setVacations((prev) => [...prev, ...data]);
        } else {
          setVacations(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching vacations:', error);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Fetch professionals once on mount (needed for the form dropdown)
  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await fetch('/api/professionals');
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  }, []);

  // Fetch all vacations for search (client-side filtering)
  const fetchAllForSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vacations?order=createdAt:desc&limit=200');
      if (response.ok) {
        const data = await response.json();
        setVacations(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching all vacations for search:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: fetch professionals once
  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Handle pagination: when page changes, fetch the appropriate data
  useEffect(() => {
    // Skip if searching (search has its own data fetching)
    if (debouncedSearchQuery !== '') {
      return;
    }

    if (page === 0) {
      // Initial load or reset
      fetchVacations(0, false);
    } else {
      // Load more pages (append to existing data)
      fetchVacations(page, true);
    }
  }, [page, debouncedSearchQuery, fetchVacations]);

  // Handle search: when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== '') {
      fetchAllForSearch();
    } else {
      // When clearing search, reset to first page
      setPage(0);
    }
  }, [debouncedSearchQuery, fetchAllForSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

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

    setIsSubmitting(true);

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
      await fetchVacations(0, false);
      resetForm();
    } catch (error) {
      console.error('Error saving vacation:', error);
      setError('Erro ao salvar período de férias');
    } finally {
      setIsSubmitting(false);
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
      await fetchVacations(0, false);
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

  // Filter vacations using optimized name lookup
  const filteredVacations = useMemo(() => {
    if (!debouncedSearchQuery) return vacations;

    const query = debouncedSearchQuery.toLowerCase();
    return vacations.filter((vacation) => {
      const professionalName = getProfessionalName(vacation.professionalId).toLowerCase();
      return professionalName.includes(query);
    });
  }, [vacations, debouncedSearchQuery, getProfessionalName]);

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-blue-600" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Períodos de Férias
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-3">
              Gerencie os períodos aquisitivos e de gozo de férias
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="search-container">
              <Search className="search-icon" suppressHydrationWarning />
              <input
                type="text"
                placeholder="Buscar por nome do profissional..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-search"
              />
            </div>

            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                disabled={isDemo || loading}
                className="btn-action"
              >
                <Plus className="w-5 h-5 mr-2" suppressHydrationWarning />
                <span className="font-semibold whitespace-nowrap">Novo Período</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 alert-warning">
            <AlertCircle className="alert-warning-icon" />
            <div className="flex-1">
              <p className="alert-warning-title">Atenção</p>
              <p className="alert-warning-text">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="alert-warning-close">
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
            <div className="card-header">
              <h2 className="heading-section">
                {editingId ? 'Editar Período de Férias' : 'Novo Período de Férias'}
              </h2>
              <button onClick={resetForm} className="btn-close">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-group">
              <div>
                <label className="form-label">Profissional</label>
                <select
                  value={formData.professionalId}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                  className="select-base"
                  required
                  disabled={isSubmitting}
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
                  <label className="form-label">Início Período Aquisitivo</label>
                  <SingleDatePicker
                    date={formData.acquisitionStartDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, acquisitionStartDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="form-label">Fim Período Aquisitivo</label>
                  <SingleDatePicker
                    date={formData.acquisitionEndDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, acquisitionEndDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={isSubmitting}
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
                    <div className="text-muted">
                      <span className="font-semibold">Período Concessivo: </span>
                      {formatDateToPtBR(concessivePeriod.start)} até{' '}
                      {formatDateToPtBR(concessivePeriod.end)}
                    </div>
                  );
                })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Início Período de Gozo</label>
                  <SingleDatePicker
                    date={formData.usageStartDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, usageStartDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="form-label">Fim Período de Gozo</label>
                  <SingleDatePicker
                    date={formData.usageEndDate}
                    onDateChange={(date) =>
                      setFormData({ ...formData, usageEndDate: date || null })
                    }
                    placeholder="Selecione a data"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingId ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : editingId ? (
                    'Atualizar'
                  ) : (
                    'Criar'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="stack-list">
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
              <p className="text-muted">
                Nenhum período de férias encontrado para &quot;{debouncedSearchQuery}&quot;
              </p>
            </div>
          </Card>
        )}

        {!loading && filteredVacations.length > 0 && (
          <div className="stack-list">
            {filteredVacations.map((vacation, index) => (
              <div
                key={vacation.id}
                ref={index === filteredVacations.length - 1 ? lastElementRef : null}
              >
                <Card className="card-hover">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="heading-card mb-1">
                          {getProfessionalName(vacation.professionalId)}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-label mb-1">Período Aquisitivo</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDateToPtBR(vacation.acquisitionStartDate)} até{' '}
                            {formatDateToPtBR(vacation.acquisitionEndDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-label mb-1">Período de Gozo</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDateToPtBR(vacation.usageStartDate)} até{' '}
                            {formatDateToPtBR(vacation.usageEndDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-label mb-1">Período Concessivo</p>
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
                          <span className="text-label">Total de Dias:</span>
                          <span className="value-number-primary">{vacation.totalDays} dias</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-label">Abatimento:</span>
                          <span className="value-currency-negative">
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
                        className="flex-1 md:flex-none md:w-28 btn-card-action"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="ml-2 font-medium">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(vacation.id)}
                        disabled={isDemo}
                        className="flex-1 md:flex-none md:w-28 btn-card-action"
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
            <Loader2 className="w-8 h-8 loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}
