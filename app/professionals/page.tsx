'use client';

import { AlertCircle, Edit2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createProfessionalAction,
  deleteProfessionalAction,
  updateProfessionalAction,
} from '@/app/actions/professionals';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { Professional } from '@/types';

export default function ProfessionalsPage() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@sistema-ferias.com';
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

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
    name: '',
    clientManager: '',
    monthlyRevenue: '',
  });

  const fetchProfessionals = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const offset = pageNum * PAGE_SIZE;
      const response = await fetch(`/api/professionals?limit=${PAGE_SIZE}&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setProfessionals((prev) => [...prev, ...data]);
        } else {
          setProfessionals(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchAllForSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/professionals?limit=200');
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching all professionals for search:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle pagination: when page changes, fetch the appropriate data
  useEffect(() => {
    // Skip if searching (search has its own data fetching)
    if (searchQuery !== '') {
      return;
    }

    if (page === 0) {
      // Initial load or reset
      fetchProfessionals(0, false);
    } else {
      // Load more pages (append to existing data)
      fetchProfessionals(page, true);
    }
  }, [page, searchQuery, fetchProfessionals]);

  // Handle search: when search query changes
  useEffect(() => {
    if (searchQuery !== '') {
      fetchAllForSearch();
    } else {
      // When clearing search, reset to first page
      setPage(0);
    }
  }, [searchQuery, fetchAllForSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await updateProfessionalAction(editingId, formData);
      } else {
        result = await createProfessionalAction(formData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      setPage(0);
      await fetchProfessionals(0, false);
      resetForm();
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
      const result = await deleteProfessionalAction(id);

      if (result.error) {
        setError(result.error);
        return;
      }

      setPage(0);
      await fetchProfessionals(0, false);
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

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const query = searchQuery.toLowerCase();
      return (
        professional.name.toLowerCase().includes(query) ||
        professional.clientManager.toLowerCase().includes(query)
      );
    });
  }, [professionals, searchQuery]);

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-blue-600" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Profissionais
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-3">
              Gerencie os profissionais e seus faturamentos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="search-container">
              <Search className="search-icon" suppressHydrationWarning />
              <input
                type="text"
                placeholder="Buscar por nome ou gestor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-search"
              />
            </div>

            {!showForm && (
              <Button onClick={() => setShowForm(true)} disabled={isDemo} className="btn-action">
                <Plus className="w-5 h-5 mr-2" suppressHydrationWarning />
                <span className="font-semibold whitespace-nowrap">Novo Profissional</span>
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

        {/* Form */}
        {showForm && !isDemo && (
          <Card className="mb-6">
            <div className="card-header">
              <h2 className="heading-section">
                {editingId ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button onClick={resetForm} className="btn-close">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-group">
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

              <div className="form-actions">
                <Button type="submit">{editingId ? 'Atualizar' : 'Criar'}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid-cards">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="divider">
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : /* Professionals List */
        professionals.length === 0 ? (
          <EmptyState
            icon="users"
            title="Nenhum profissional cadastrado"
            description="Adicione profissionais para gerenciar seus faturamentos e períodos de férias"
          />
        ) : filteredProfessionals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-muted">
                Nenhum profissional encontrado para &quot;{searchQuery}&quot;
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid-cards">
            {filteredProfessionals.map((professional, index) => (
              <div
                key={professional.id}
                ref={index === filteredProfessionals.length - 1 ? lastElementRef : null}
              >
                <Card className="card-hover">
                  <div className="space-y-3">
                    <div>
                      <h3 className="heading-card">{professional.name}</h3>
                      <p className="text-muted">Gestor: {professional.clientManager}</p>
                    </div>

                    <div className="divider">
                      <p className="text-label mb-1">Faturamento Mensal</p>
                      <p className="value-currency-positive">
                        {formatCurrency(professional.monthlyRevenue)}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(professional)}
                        disabled={isDemo}
                        className="btn-card-action"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="ml-2 font-medium">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(professional.id)}
                        disabled={isDemo}
                        className="btn-card-action"
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
