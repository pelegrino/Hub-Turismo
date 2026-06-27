use crate::models::empresa::Empresa;
use tauri::State;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct BackupData {
    pub version: u32,
    pub exported_at: String,
    pub total: usize,
    pub empresas: Vec<BackupEmpresa>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct BackupEmpresa {
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

#[tauri::command]
pub async fn exportar_backup(
    db: State<'_, crate::database::DbState>,
    caminho: String,
) -> Result<String, String> {
    let empresas = sqlx::query_as::<_, Empresa>(
        "SELECT id, empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento, created_at, updated_at FROM empresas ORDER BY id"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| format!("Erro ao ler dados: {}", e))?;

    let backup_empresas: Vec<BackupEmpresa> = empresas
        .into_iter()
        .map(|e| BackupEmpresa {
            empresa: e.empresa,
            representante: e.representante,
            cargo: e.cargo,
            telefone: e.telefone,
            email: e.email,
            site: e.site,
            cidade: e.cidade,
            estado: e.estado,
            endereco: e.endereco,
            tags: e.tags,
            evento: e.evento,
        })
        .collect();

    let backup = BackupData {
        version: 1,
        exported_at: chrono::Utc::now().to_rfc3339(),
        total: backup_empresas.len(),
        empresas: backup_empresas,
    };

    let json =
        serde_json::to_string_pretty(&backup).map_err(|e| format!("Erro ao serializar: {}", e))?;

    std::fs::write(&caminho, &json).map_err(|e| format!("Erro ao escrever arquivo: {}", e))?;

    Ok(format!(
        "Backup concluído! {} empresas exportadas para:\n{}",
        backup.total, caminho
    ))
}

#[tauri::command]
pub async fn importar_backup(
    db: State<'_, crate::database::DbState>,
    caminho: String,
) -> Result<String, String> {
    let json =
        std::fs::read_to_string(&caminho).map_err(|e| format!("Erro ao ler arquivo: {}", e))?;

    let backup: BackupData =
        serde_json::from_str(&json).map_err(|e| format!("Erro ao analisar JSON: {}", e))?;

    if backup.version != 1 {
        return Err(format!(
            "Versão de backup não suportada: {}",
            backup.version
        ));
    }

    if backup.empresas.is_empty() {
        return Err("O arquivo de backup está vazio.".to_string());
    }

    // Usa transação para garantir atomicidade
    let mut tx =
        db.0.begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

    // Limpa dados existentes
    sqlx::query("DELETE FROM empresas")
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Erro ao limpar dados: {}", e))?;

    // Insere dados do backup
    for emp in &backup.empresas {
        sqlx::query(
            r#"
            INSERT INTO empresas (empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&emp.empresa)
        .bind(&emp.representante)
        .bind(&emp.cargo)
        .bind(&emp.telefone)
        .bind(&emp.email)
        .bind(&emp.site)
        .bind(&emp.cidade)
        .bind(&emp.estado)
        .bind(&emp.endereco)
        .bind(&emp.tags)
        .bind(&emp.evento)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Erro ao importar empresa '{}': {}", emp.empresa, e))?;
    }

    tx.commit()
        .await
        .map_err(|e| format!("Erro ao finalizar importação: {}", e))?;

    Ok(format!(
        "Restauração concluída! {} empresas importadas de:\n{}",
        backup.empresas.len(),
        caminho
    ))
}
