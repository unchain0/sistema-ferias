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

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/professionals?limit=${PAGE_SIZE}&offset=0`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreProfessionals = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/professionals?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      );
      if (response.ok) {
        const data = await response.json();
        setProfessionals((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error loading more professionals:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    if (page === 0) {
      fetchProfessionals();
    } else {
      loadMoreProfessionals();
    }
  }, [page, fetchProfessionals, loadMoreProfessionals]);

  const fetchAllForSearch = useCallback(async () => {
    // If searching, we fetch all to allow client-side filtering as per existing logic
    // or we could implement server-side search. For now, let's stick to client-side
    // but fetch all if a search is active.
    try {
      const response = await fetch('/api/professionals');
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching all professionals for search:', error);
    }
  }, []);

  useEffect(() => {
    if (searchQuery !== '') {
      fetchAllForSearch();
    } else if (page === 0) {
      fetchProfessionals();
    }
  }, [searchQuery, page, fetchAllForSearch, fetchProfessionals]);

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
      await fetchProfessionals();
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
      await fetchProfessionals();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profissionais</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="pt-3 border-t dark:border-gray-700">
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
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum profissional encontrado para &quot;{searchQuery}&quot;
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional, index) => (
              <div
                key={professional.id}
                ref={index === filteredProfessionals.length - 1 ? lastElementRef : null}
              >
                <Card>
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
                        variant="destructive"
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
