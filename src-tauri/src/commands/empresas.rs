use crate::models::empresa::{
    AtualizaEmpresa, Empresa, EmpresaFiltro, EmpresasPaginadas, NovaEmpresa,
};
use tauri::State;

#[tauri::command]
pub async fn listar_empresas(
    db: State<'_, crate::database::DbState>,
    filtro: Option<EmpresaFiltro>,
) -> Result<EmpresasPaginadas, String> {
    let filtro = filtro.unwrap_or_default();
    let pagina = filtro.pagina.unwrap_or(1).max(1);
    let por_pagina = filtro.por_pagina.unwrap_or(25).clamp(1, 100);
    let offset = (pagina - 1) * por_pagina;

    let mut where_clauses = Vec::new();
    let mut args: Vec<String> = Vec::new();

    if let Some(busca) = &filtro.busca {
        if !busca.trim().is_empty() {
            where_clauses.push("(empresa LIKE ? OR representante LIKE ? OR cargo LIKE ? OR telefone LIKE ? OR email LIKE ? OR cidade LIKE ? OR estado LIKE ? OR tags LIKE ? OR evento LIKE ?)");
            let busca_term = format!("%{}%", busca);
            for _ in 0..9 {
                args.push(busca_term.clone());
            }
        }
    }
    if let Some(cidade) = &filtro.cidade {
        if !cidade.trim().is_empty() {
            where_clauses.push("cidade = ?");
            args.push(cidade.clone());
        }
    }
    if let Some(estado) = &filtro.estado {
        if !estado.trim().is_empty() {
            where_clauses.push("estado = ?");
            args.push(estado.clone());
        }
    }
    if let Some(evento) = &filtro.evento {
        if !evento.trim().is_empty() {
            where_clauses.push("evento = ?");
            args.push(evento.clone());
        }
    }
    if let Some(tag) = &filtro.tags {
        if !tag.trim().is_empty() {
            where_clauses.push("tags LIKE ?");
            args.push(format!("%{}%", tag));
        }
    }

    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };

    let count_query = format!("SELECT COUNT(*) FROM empresas {}", where_sql);
    let mut count_query_builder = sqlx::query_scalar::<_, i64>(&count_query);
    for arg in &args {
        count_query_builder = count_query_builder.bind(arg);
    }
    let total: i64 = count_query_builder
        .fetch_one(&db.0)
        .await
        .map_err(|e| e.to_string())?;

    let data_query = format!(
        "SELECT id, empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento, created_at, updated_at FROM empresas {} ORDER BY empresa ASC LIMIT ? OFFSET ?",
        where_sql
    );
    let mut data_query_builder = sqlx::query_as::<_, Empresa>(&data_query);
    for arg in &args {
        data_query_builder = data_query_builder.bind(arg);
    }
    data_query_builder = data_query_builder.bind(por_pagina).bind(offset);
    let empresas = data_query_builder
        .fetch_all(&db.0)
        .await
        .map_err(|e| e.to_string())?;

    let total_paginas = (total as f64 / por_pagina as f64).ceil() as i64;

    Ok(EmpresasPaginadas {
        empresas,
        total,
        pagina,
        por_pagina,
        total_paginas,
    })
}

#[tauri::command]
pub async fn buscar_empresa(
    db: State<'_, crate::database::DbState>,
    id: i64,
) -> Result<Option<Empresa>, String> {
    let empresa = sqlx::query_as::<_, Empresa>(
        "SELECT id, empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento, created_at, updated_at FROM empresas WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&db.0)
    .await
    .map_err(|e| e.to_string())?;
    Ok(empresa)
}

#[tauri::command]
pub async fn criar_empresa(
    db: State<'_, crate::database::DbState>,
    nova: NovaEmpresa,
) -> Result<Empresa, String> {
    let now = chrono::Utc::now();
    let result = sqlx::query(
        r#"
        INSERT INTO empresas (empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&nova.empresa)
    .bind(&nova.representante)
    .bind(&nova.cargo)
    .bind(&nova.telefone)
    .bind(&nova.email)
    .bind(&nova.site)
    .bind(&nova.cidade)
    .bind(&nova.estado)
    .bind(&nova.endereco)
    .bind(&nova.tags)
    .bind(&nova.evento)
    .bind(now)
    .bind(now)
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    buscar_empresa(db, id)
        .await?
        .ok_or("Erro ao criar empresa".to_string())
}

#[tauri::command]
pub async fn atualizar_empresa(
    db: State<'_, crate::database::DbState>,
    id: i64,
    atualiza: AtualizaEmpresa,
) -> Result<Empresa, String> {
    let mut updates = Vec::new();

    if atualiza.empresa.is_some() {
        updates.push("empresa = ?");
    }
    if atualiza.representante.is_some() {
        updates.push("representante = ?");
    }
    if atualiza.cargo.is_some() {
        updates.push("cargo = ?");
    }
    if atualiza.telefone.is_some() {
        updates.push("telefone = ?");
    }
    if atualiza.email.is_some() {
        updates.push("email = ?");
    }
    if atualiza.site.is_some() {
        updates.push("site = ?");
    }
    if atualiza.cidade.is_some() {
        updates.push("cidade = ?");
    }
    if atualiza.estado.is_some() {
        updates.push("estado = ?");
    }
    if atualiza.endereco.is_some() {
        updates.push("endereco = ?");
    }
    if atualiza.tags.is_some() {
        updates.push("tags = ?");
    }
    if atualiza.evento.is_some() {
        updates.push("evento = ?");
    }

    if updates.is_empty() {
        return Err("Nenhum campo para atualizar".to_string());
    }

    updates.push("updated_at = ?");

    let query = format!("UPDATE empresas SET {} WHERE id = ?", updates.join(", "));

    let mut query_builder = sqlx::query(&query);

    if let Some(v) = &atualiza.empresa {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.representante {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.cargo {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.telefone {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.email {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.site {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.cidade {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.estado {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.endereco {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.tags {
        query_builder = query_builder.bind(v);
    }
    if let Some(v) = &atualiza.evento {
        query_builder = query_builder.bind(v);
    }

    query_builder = query_builder.bind(chrono::Utc::now());
    query_builder = query_builder.bind(id);

    query_builder
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;

    buscar_empresa(db, id)
        .await?
        .ok_or("Empresa não encontrada".to_string())
}

#[tauri::command]
pub async fn deletar_empresa(
    db: State<'_, crate::database::DbState>,
    id: i64,
) -> Result<bool, String> {
    let result = sqlx::query("DELETE FROM empresas WHERE id = ?")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn listar_cidades(
    db: State<'_, crate::database::DbState>,
) -> Result<Vec<String>, String> {
    let cidades = sqlx::query_scalar::<_, String>(
        "SELECT DISTINCT cidade FROM empresas WHERE cidade IS NOT NULL AND cidade != '' ORDER BY cidade"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;
    Ok(cidades)
}

#[tauri::command]
pub async fn listar_estados(
    db: State<'_, crate::database::DbState>,
) -> Result<Vec<String>, String> {
    let estados = sqlx::query_scalar::<_, String>(
        "SELECT DISTINCT estado FROM empresas WHERE estado IS NOT NULL AND estado != '' ORDER BY estado"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;
    Ok(estados)
}

#[tauri::command]
pub async fn listar_eventos(
    db: State<'_, crate::database::DbState>,
) -> Result<Vec<String>, String> {
    let eventos = sqlx::query_scalar::<_, String>(
        "SELECT DISTINCT evento FROM empresas WHERE evento IS NOT NULL AND evento != '' ORDER BY evento"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;
    Ok(eventos)
}

#[tauri::command]
pub async fn listar_tags(db: State<'_, crate::database::DbState>) -> Result<Vec<String>, String> {
    let tags_rows = sqlx::query_scalar::<_, String>(
        "SELECT tags FROM empresas WHERE tags IS NOT NULL AND tags != ''",
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    let mut todas_tags = std::collections::HashSet::new();
    for tags_str in tags_rows {
        for tag in tags_str.split(',') {
            let tag = tag.trim();
            if !tag.is_empty() {
                todas_tags.insert(tag.to_string());
            }
        }
    }
    let mut tags: Vec<String> = todas_tags.into_iter().collect();
    tags.sort();
    Ok(tags)
}
