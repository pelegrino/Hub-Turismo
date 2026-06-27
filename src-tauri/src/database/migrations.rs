use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Create empresas table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS empresas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empresa TEXT NOT NULL,
            representante TEXT,
            cargo TEXT,
            telefone TEXT,
            email TEXT,
            site TEXT,
            cidade TEXT,
            estado TEXT,
            endereco TEXT,
            tags TEXT,
            evento TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create indexes for better search performance
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_empresas_empresa ON empresas(empresa)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_empresas_cidade ON empresas(cidade)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_empresas_evento ON empresas(evento)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_empresas_tags ON empresas(tags)")
        .execute(pool)
        .await?;

    // Create trigger to update updated_at
    sqlx::query(
        r#"
        CREATE TRIGGER IF NOT EXISTS update_empresas_updated_at
        AFTER UPDATE ON empresas
        BEGIN
            UPDATE empresas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
        "#,
    )
    .execute(pool)
    .await?;

    // Create categorias table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            icone TEXT NOT NULL DEFAULT 'Tag',
            cor TEXT NOT NULL DEFAULT 'gray'
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Seed default categories if table is empty
    let cat_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM categorias")
        .fetch_one(pool)
        .await?;

    if cat_count == 0 {
        sqlx::query(
            r#"
            INSERT INTO categorias (nome, icone, cor) VALUES
            ('Hotel', 'Building2', 'blue'),
            ('Pousada', 'Home', 'green'),
            ('Resort', 'Sun', 'purple'),
            ('Operadora', 'Plane', 'orange'),
            ('Receptivo', 'MapPin', 'teal'),
            ('Seguro', 'Shield', 'red'),
            ('Rede de Hotéis', 'Building2', 'indigo'),
            ('Parque Aquatico', 'Waves', 'cyan')
            "#,
        )
        .execute(pool)
        .await?;
    }

    Ok(())
}
