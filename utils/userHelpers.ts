// utils/userHelpers.ts
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'aprovado':
      return { bg: '#dcfce7', text: '#166534' };
    case 'pendente':
      return { bg: '#fef3c7', text: '#92400e' };
    case 'reprovado':
      return { bg: '#fee2e2', text: '#991b1b' };
    case 'desativado':
      return { bg: '#f3f4f6', text: '#6b7280' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    'aprovado': 'Aprovado',
    'pendente': 'Pendente',
    'reprovado': 'Reprovado',
    'desativado': 'Desativado',
  };
  return labels[status] || status;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const filterUsers = (
  users: any[],
  activeTab: string,
  searchQuery: string
) => {
  let filtered = users;

  // Filtrar por tab
  if (activeTab !== 'todos') {
    filtered = filtered.filter(user => {
      switch (activeTab) {
        case 'pendentes':
          return user.status === 'pendente';
        case 'aprovados':
          return user.status === 'aprovado';
        case 'reprovados':
          return user.status === 'reprovado';
        case 'desativados':
          return user.status === 'desativado';
        default:
          return true;
      }
    });
  }

  // Filtrar por busca
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(user =>
      user.nome.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.propriedade.toLowerCase().includes(query)
    );
  }

  return filtered;
};