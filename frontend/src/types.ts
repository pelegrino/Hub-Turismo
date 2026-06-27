export interface Empresa {
  id: number;
  empresa: string;
  representante?: string | null;
  cargo?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  tags?: string | null;
  evento?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NovaEmpresa {
  empresa: string;
  representante?: string | null;
  cargo?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  tags?: string | null;
  evento?: string | null;
}

export interface AtualizaEmpresa {
  empresa?: string | null;
  representante?: string | null;
  cargo?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  tags?: string | null;
  evento?: string | null;
}

export interface EmpresaFiltro {
  busca?: string | null;
  cidade?: string | null;
  estado?: string | null;
  tags?: string | null;
  evento?: string | null;
  pagina?: number | null;
  por_pagina?: number | null;
}

export interface EmpresasPaginadas {
  empresas: Empresa[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}
