use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Empresa {
    pub id: i64,
    pub empresa: String,
    pub representante: Option<String>,
    pub cargo: Option<String>,
    pub telefone: Option<String>,
    pub email: Option<String>,
    pub site: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub endereco: Option<String>,
    pub tags: Option<String>,
    pub evento: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NovaEmpresa {
    pub empresa: String,
    pub representante: Option<String>,
    pub cargo: Option<String>,
    pub telefone: Option<String>,
    pub email: Option<String>,
    pub site: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub endereco: Option<String>,
    pub tags: Option<String>,
    pub evento: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AtualizaEmpresa {
    pub empresa: Option<String>,
    pub representante: Option<String>,
    pub cargo: Option<String>,
    pub telefone: Option<String>,
    pub email: Option<String>,
    pub site: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub endereco: Option<String>,
    pub tags: Option<String>,
    pub evento: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EmpresaFiltro {
    pub busca: Option<String>,
    pub cidade: Option<String>,
    pub estado: Option<String>,
    pub tags: Option<String>,
    pub evento: Option<String>,
    pub pagina: Option<i64>,
    pub por_pagina: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmpresasPaginadas {
    pub empresas: Vec<Empresa>,
    pub total: i64,
    pub pagina: i64,
    pub por_pagina: i64,
    pub total_paginas: i64,
}
