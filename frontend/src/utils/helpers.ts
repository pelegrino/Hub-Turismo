export function getCategoriaInfo(tags?: string | null) {
  if (!tags) return { label: 'Não informado', color: 'gray', icon: 'HelpCircle' };

  const tagList = tags.split(',').map(t => t.trim().toLowerCase());

  const categorias: Record<string, { label: string; color: string; icon: string }> = {
    hotel: { label: 'Hotel', color: 'blue', icon: 'Building2' },
    pousada: { label: 'Pousada', color: 'green', icon: 'Home' },
    resort: { label: 'Resort', color: 'purple', icon: 'Sun' },
    operadora: { label: 'Operadora', color: 'orange', icon: 'Plane' },
    receptivo: { label: 'Receptivo', color: 'teal', icon: 'MapPin' },
    seguro: { label: 'Seguro', color: 'red', icon: 'Shield' },
    'rede de hotéis': { label: 'Rede de Hotéis', color: 'indigo', icon: 'Building2' },
    'parque aquatico': { label: 'Parque Aquático', color: 'cyan', icon: 'Waves' },
  };

  for (const tag of tagList) {
    if (categorias[tag]) return categorias[tag];
  }

  return { label: tagList[0], color: 'gray', icon: 'Tag' };
}

export function formatPhone(phone?: string | null) {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

export function cleanPhone(phone?: string | null) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function getInitials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(str: string) {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-teal-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500',
    'bg-cyan-500', 'bg-amber-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
