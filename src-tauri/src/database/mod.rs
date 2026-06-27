use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use tauri::Manager;

pub mod migrations;

pub struct DbState(pub SqlitePool);

pub async fn init_db(app_handle: &tauri::AppHandle) -> Result<SqlitePool, sqlx::Error> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");

    std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");

    let db_path = app_dir.join("hubturismo.db");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run migrations
    migrations::run_migrations(&pool).await?;

    Ok(pool)
}
