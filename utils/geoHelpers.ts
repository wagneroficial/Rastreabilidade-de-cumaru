// utils/geoHelpers.ts
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

export const getMarkerColor = (status: string): string => {
  switch (status) {
    case 'planejado': return '#f59e0b';
    case 'ativo': return '#16a34a';
    case 'inativo': return '#ef4444';
    default: return '#6b7280';
  }
};

export const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'planejado': 'Planejado',
    'ativo': 'Ativo',
    'inativo': 'Inativo',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): { bg: string; text: string } => {
  switch (status) {
    case 'planejado': return { bg: '#fef3c7', text: '#f59e0b' };
    case 'ativo': return { bg: '#dcfce7', text: '#16a34a' };
    case 'inativo': return { bg: '#fee2e2', text: '#ef4444' };
    default: return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export const isWithinRadius = (
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = 20
): boolean => {
  const R = 6371000;
  const dLat = (targetLat - currentLat) * Math.PI / 180;
  const dLng = (targetLng - currentLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(currentLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= radiusMeters;
};