use crate::models::categoria::Categoria;
use tauri::State;

#[tauri::command]
pub async fn listar_categorias(
    db: State<'_, crate::database::DbState>,
) -> Result<Vec<Categoria>, String> {
    let categorias =
        sqlx::query_as::<_, Categoria>("SELECT id, nome, icone, cor FROM categorias ORDER BY nome")
            .fetch_all(&db.0)
            .await
            .map_err(|e| e.to_string())?;
    Ok(categorias)
}

#[tauri::command]
pub async fn criar_categoria(
    db: State<'_, crate::database::DbState>,
    nome: String,
    icone: String,
    cor: String,
) -> Result<Categoria, String> {
    let result = sqlx::query("INSERT INTO categorias (nome, icone, cor) VALUES (?, ?, ?)")
        .bind(&nome)
        .bind(&icone)
        .bind(&cor)
        .execute(&db.0)
        .await
        .map_err(|e| format!("Erro ao criar categoria: {}", e))?;

    let id = result.last_insert_rowid();

    sqlx::query_as::<_, Categoria>("SELECT id, nome, icone, cor FROM categorias WHERE id = ?")
        .bind(id)
        .fetch_one(&db.0)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn atualizar_categoria(
    db: State<'_, crate::database::DbState>,
    id: i64,
    nome: String,
    icone: String,
    cor: String,
) -> Result<Categoria, String> {
    sqlx::query("UPDATE categorias SET nome = ?, icone = ?, cor = ? WHERE id = ?")
        .bind(&nome)
        .bind(&icone)
        .bind(&cor)
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| format!("Erro ao atualizar categoria: {}", e))?;

    sqlx::query_as::<_, Categoria>("SELECT id, nome, icone, cor FROM categorias WHERE id = ?")
        .bind(id)
        .fetch_one(&db.0)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn deletar_categoria(
    db: State<'_, crate::database::DbState>,
    id: i64,
) -> Result<bool, String> {
    let result = sqlx::query("DELETE FROM categorias WHERE id = ?")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(result.rows_affected() > 0)
}
