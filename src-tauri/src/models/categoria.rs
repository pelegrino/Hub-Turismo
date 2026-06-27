use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Categoria {
    pub id: i64,
    pub nome: String,
    pub icone: String,
    pub cor: String,
}
