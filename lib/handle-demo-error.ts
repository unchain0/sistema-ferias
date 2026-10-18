export function handleDemoError(
  response: Response,
  data: Readonly<Record<string, unknown>>
): string | null {
  const isDemo = data['demo'] === true;
  if (response.status === 403 && isDemo) {
    return 'Modo demonstração: Você está visualizando o sistema com dados de exemplo. Modificações não são permitidas.';
  }
  return null;
}