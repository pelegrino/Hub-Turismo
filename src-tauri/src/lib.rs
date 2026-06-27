use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // Initialize database synchronously so it's ready before the frontend loads
            let pool =
                tauri::async_runtime::block_on(async { crate::database::init_db(&handle).await })
                    .expect("Failed to initialize database");

            app.manage(crate::database::DbState(pool.clone()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::commands::empresas::listar_empresas,
            crate::commands::empresas::buscar_empresa,
            crate::commands::empresas::criar_empresa,
            crate::commands::empresas::atualizar_empresa,
            crate::commands::empresas::deletar_empresa,
            crate::commands::empresas::listar_cidades,
            crate::commands::empresas::listar_estados,
            crate::commands::empresas::listar_eventos,
            crate::commands::empresas::listar_tags,
            crate::commands::categorias::listar_categorias,
            crate::commands::categorias::criar_categoria,
            crate::commands::categorias::atualizar_categoria,
            crate::commands::categorias::deletar_categoria,
            crate::commands::backup::exportar_backup,
            crate::commands::backup::importar_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands;
mod database;
mod models;
