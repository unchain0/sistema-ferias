export function handleDemoError(response: Response, data: any): string | null {
  if (response.status === 403 && data?.demo) {
    return 'Modo demonstração: Você está visualizando o sistema com dados de exemplo. Modificações não são permitidas.';
  }
  return null;
}
