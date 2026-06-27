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

    Ok(())
}

pub async fn seed_database(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Check if data already exists
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM empresas")
        .fetch_one(pool)
        .await?;

    if count > 0 {
        return Ok(());
    }

    // Insert sample data from CSV
    let empresas = vec![
        ("Laghetto Hotéis", Some("Jussara Kroetz"), Some("Comercial"), Some("54 99219-8810"), Some("comercial7@laghettohoteis.com.br"), Some("laghetto.com.br"), Some("Gramado"), Some("RS"), Some("Rua Coronel João Corrêa, 287 Sala 05"), Some("Hotel"), Some("Avirp 2023")),
        ("Pousada Xamã", Some("Wanderson Borges"), None, Some("84 99608-9999"), Some("wb@pousadaxama.com.br"), Some("pousadaxama.com.br"), Some("Tibau do Sul"), Some("RN"), Some("Rua dos Cajueiros, 45 - Pipa"), Some("Pousada"), Some("Avirp 2023")),
        ("Nord Hotels", None, Some("Comercial"), Some("83 99880-0041"), Some("reservas@nordhoteis.com.br"), Some("nordhoteis.com.br"), Some("João Pessoa"), Some("PB"), Some("Rua Prefeito José Leite, 106"), Some("Hotel"), Some("Avirp 2023")),
        ("Hotel Parque das Fontes", Some("Gabriela Bastos"), None, Some("85 99982-1696"), Some("gabriela@hotelparquedasfontes.com.br"), Some("hotelparquedasfontes.com.br"), Some("Beberibe"), Some("CE"), Some("Av. Cel. Antonio Teixa Filho s/nº"), Some("Hotel, Parque Aquatico"), Some("Avirp 2023")),
        ("ERTour", Some("João Vianna Neto"), Some("Founder & CEO"), Some("73 99191-2255"), Some("joaoneto@ertour.com.br"), Some("ertour.com.br"), Some("Ilheús"), Some("BA"), Some("Rua David Maia, 246 - Pontal"), Some("Receptivo"), Some("Avirp 2023")),
        ("SPI Turismo", Some("Edson Rios"), None, Some("14 99754-8258"), Some("edson@spturismo.com.br"), Some("spiturismo.com.br"), Some("Bauru"), Some("SP"), Some("Av. Getúlio Vargas, 12-80 - Sala 20 - Jd. América"), Some("Seguro"), Some("Avirp 2023")),
        ("Grupo Top Mais", Some("Glaucia Barros"), Some("Comercial"), Some("73 99853-9451"), Some("receptivo@topmaisturismo.com.br"), Some("grupotopmais.com"), Some("Porto Seguro"), Some("BA"), Some("Travessa Adno Musser, 115 - Tabapiri"), Some("Receptivo"), Some("Avirp 2023")),
        ("Cativa Operadora", Some("Carlos Leonardi"), Some("Executivo de Contas"), Some("16 99762-4562"), Some("ribeiraoetriangulo@cativaoperadora.com.br"), Some("cativaoperadora.com.br"), Some("Porto Alegre"), Some("RS"), Some("Rua dos Andradas, 1234 - 7º Andar"), Some("Operadora"), Some("Avirp 2023")),
        ("Hotel Areia de Ouro", Some("George dos Santos"), Some("Gerente Comercial"), Some("84 99976-0079"), Some("reservas@areiadeouro.com.br"), Some("areiadeouro.com.br"), Some("Natal"), Some("RN"), Some("Rua Elia Barros, 250 - Ponta Negra"), Some("Hotel"), Some("Avirp 2023")),
        ("Esmeralda Praia Hotel", Some("Luciana Martins"), Some("Gerente de Conta"), Some("84 98701-2964"), Some("luciana.esmeraldahotel@gmail.com"), Some("esmeraldahotel.com.br"), Some("Natal"), Some("RN"), Some("Rua Francisco Gurgel, 1160"), Some("Hotel"), Some("Avirp 2023")),
        ("VM Turismo", Some("Claudiana Matos"), Some("Consultora Comercial"), Some("84 99970-0030"), Some("comercial@vmturismo.com.br"), Some("vmturismo.com.br"), Some("Fortaleza"), Some("CE"), Some("Rua Osvaldo Cruz, 01 - Sala 1309"), Some("Receptivo"), Some("Avirp 2023")),
        ("Iberostar", Some("Zara Bastos"), Some("Gerente Regional Nordeste"), Some("71 99707-5563"), Some("zara.bastos@iberostar.com"), Some("iberostar.com"), Some("Salvador"), Some("BA"), Some("Rua das Alfazemas, 761 - Sl. 306 - Caminho das Árvores"), Some("Resort"), Some("Avirp 2023")),
        ("Sandro Seguros", Some("Sandro P. Rossi"), Some("Corretor de Seguros"), Some("14 99784-7783"), Some("alveserossiseguros@gmail.com"), None, Some("Tupã"), Some("SP"), Some("Rua Tupis, 177 - Sala 2"), Some("Seguro"), Some("Avirp 2023")),
        ("Brocker Turismo", Some("Andrea Costa"), Some("Agente Comercial"), Some("54 98100-0800"), Some("comercial@brockerturismo.com.br"), Some("brockerturismo.com.br"), Some("Canela"), Some("RS"), Some("Rua Borges de Medeiros, 851"), Some("Operadora"), Some("Avirp 2023")),
        ("D Beach Resort", Some("Thêmis Godoy"), Some("Executiva de Vendas"), Some("84 99927-2597"), Some("vendas@dbeachresort.com"), Some("dbeachresort.com"), Some("Natal"), Some("RN"), Some("Rua da Praia, 150A - Ponta Negra"), Some("Resort"), Some("Avirp 2023")),
        ("MME Hotéis", Some("Ramon Lamas"), Some("Executivo Comercial"), Some("82 98751-8533"), Some("ramon@mmehoteis.com.br"), Some("mmehoteis.com.br"), Some("Maceió"), Some("AL"), Some("Av. Álvaro Otacilio, 2991 - Ponta Verde"), Some("Rede de Hotéis"), Some("Avirp 2023")),
        ("Brocker Turismo", Some("Deise Gomes"), Some("Gerente B2B"), Some("54 99311-8844"), Some("deise.gomes@brockerturismo.com.br"), Some("brockerturismo.com.br"), Some("Canela"), Some("RS"), Some("Rua Borges de Medeiros, 851"), Some("Operadora"), Some("Avirp 2023")),
        ("Master Hotéis", Some("Maria Fandhrs de Souza"), Some("Executiva de Contas"), Some("51 99511-9269"), Some("maria.souza@masterhoteis.com.br"), Some("masterhoteis.com.br"), Some("Gramado"), Some("RS"), Some("Rua Carlos Lengler Filho - Vila Jardim"), Some("Hotel"), Some("Avirp 2023")),
        ("Hotel Sarana", Some("Laís Freitas"), Some("Comercial"), Some("73 99848-1505"), Some("comercial@hotelsarana.com.br"), Some("hotelsarana.com.br"), Some("Porto Seguro"), Some("BA"), Some("Av. Beira Mar, 5261 - Praia de Taperapuan"), Some("Hotel"), Some("Avirp 2023")),
        ("Pousada Amada Terra", None, None, Some("81 97323-8351"), Some("reservas@pousadaamadaterra.com.br"), Some("pousadaamadaterra.com.br"), Some("Porto de Galinhas"), Some("PE"), Some("Rua Figueira, 4"), Some("Pousada"), Some("Avirp 2023")),
        ("Resort Arcobaleno", Some("Francisco Timbó"), Some("Representante Comercial"), Some("11 98610-1170"), Some("timborep@gmail.com"), Some("hotelarcobaleno.com.br"), Some("Porto Seguro"), Some("BA"), Some("BR-367 KM. 67 s/nº"), Some("Resort"), Some("Avirp 2023")),
    ];

    for (empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento) in empresas {
        sqlx::query(
            r#"
            INSERT INTO empresas (empresa, representante, cargo, telefone, email, site, cidade, estado, endereco, tags, evento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(empresa)
        .bind(representante)
        .bind(cargo)
        .bind(telefone)
        .bind(email)
        .bind(site)
        .bind(cidade)
        .bind(estado)
        .bind(endereco)
        .bind(tags)
        .bind(evento)
        .execute(pool)
        .await?;
    }

    Ok(())
}
