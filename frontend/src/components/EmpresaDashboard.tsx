import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import type { Empresa, EmpresaFiltro } from "../types";
import { EmpresaForm } from "./EmpresaForm";
import { BackupRestore } from "./BackupRestore";
import {
  getCategoriaInfo,
  formatPhone,
  getInitials,
  getAvatarColor,
} from "../utils/helpers";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Building2,
  Home,
  Sun,
  Plane,
  Shield,
  Waves,
  Tag,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Inbox,
} from "lucide-react";

const CATEGORIAS = [
  "Hotel",
  "Pousada",
  "Resort",
  "Operadora",
  "Receptivo",
  "Seguro",
  "Rede de Hotéis",
  "Parque Aquatico",
];

function getCategoriaIcon(tags?: string | null) {
  if (!tags) return Tag;
  const t = tags.toLowerCase();
  if (t.includes("hotel")) return Building2;
  if (t.includes("pousada")) return Home;
  if (t.includes("resort")) return Sun;
  if (t.includes("operadora")) return Plane;
  if (t.includes("receptivo")) return MapPin;
  if (t.includes("seguro")) return Shield;
  if (t.includes("rede")) return Building2;
  if (t.includes("parque")) return Waves;
  return Tag;
}

export function EmpresaDashboard() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EmpresaFiltro>({
    busca: "",
    pagina: 1,
    por_pagina: 50,
  });
  const [paginacao, setPaginacao] = useState({
    total: 0,
    total_paginas: 0,
    pagina: 1,
    por_pagina: 50,
  });
  const [cidades, setCidades] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [eventos, setEventos] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listarEmpresas(filtro);
      setEmpresas(result.empresas);
      setPaginacao({
        total: result.total,
        total_paginas: result.total_paginas,
        pagina: result.pagina,
        por_pagina: result.por_pagina,
      });
      const [c, e, ev, t] = await Promise.all([
        api.listarCidades(),
        api.listarEstados(),
        api.listarEventos(),
        api.listarTags(),
      ]);
      setCidades(c);
      setEstados(e);
      setEventos(ev);
      setTagsList(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiltro((prev) => ({ ...prev, busca: e.target.value, pagina: 1 }));

  const handleFiltroChange = (campo: keyof EmpresaFiltro, valor: string) =>
    setFiltro((prev) => ({ ...prev, [campo]: valor, pagina: 1 }));

  const handleLimparFiltros = () => {
    setFiltro({
      busca: "",
      cidade: "",
      estado: "",
      evento: "",
      tags: "",
      pagina: 1,
      por_pagina: 50,
    });
    setFiltroCategoria("");
  };

  const temFiltrosAtivos =
    filtro.busca ||
    filtro.cidade ||
    filtro.estado ||
    filtro.evento ||
    filtro.tags ||
    filtroCategoria;

  const handleDelete = async (id: number) => {
    setDeletingLoading(true);
    try {
      await api.deletarEmpresa(id);
      setDeletingId(null);
      carregarDados();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    } finally {
      setDeletingLoading(false);
    }
  };

  const filteredEmpresas = filtroCategoria
    ? empresas.filter((e) =>
        e.tags?.toLowerCase().includes(filtroCategoria.toLowerCase()),
      )
    : empresas;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <div className="logo-mark">HT</div>
          <div>
            <h1>Hub Turismo</h1>
            <p>Agenda de Contatos</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BackupRestore onSuccess={carregarDados} />
          <button
            className="btn-primary"
            onClick={() => {
              setEditingEmpresa(null);
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            <span>Novo Contato</span>
          </button>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="dash-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, representante, telefone, email, cidade..."
            value={filtro.busca || ""}
            onChange={handleBusca}
          />
        </div>

        <div className="filter-chips">
          <button
            className={`chip ${!filtroCategoria ? "active" : ""}`}
            onClick={() => setFiltroCategoria("")}
          >
            <Tag size={14} />
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              className={`chip ${filtroCategoria === cat ? "active" : ""}`}
              onClick={() =>
                setFiltroCategoria(filtroCategoria === cat ? "" : cat)
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <select
            value={filtro.cidade || ""}
            onChange={(e) => handleFiltroChange("cidade", e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filtro.estado || ""}
            onChange={(e) => handleFiltroChange("estado", e.target.value)}
          >
            <option value="">Todos os estados</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <select
            value={filtro.evento || ""}
            onChange={(e) => handleFiltroChange("evento", e.target.value)}
          >
            <option value="">Todos os eventos</option>
            {eventos.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          {temFiltrosAtivos && (
            <button className="btn-clear" onClick={handleLimparFiltros}>
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="stat-box">
          <div className="stat-icon blue">
            <Users />
          </div>
          <div className="stat-info">
            <span className="stat-num">{paginacao.total}</span>
            <span className="stat-label">Total de Contatos</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon green">
            <MapPin />
          </div>
          <div className="stat-info">
            <span className="stat-num">{cidades.length}</span>
            <span className="stat-label">Cidades</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon orange">
            <Globe />
          </div>
          <div className="stat-info">
            <span className="stat-num">{estados.length}</span>
            <span className="stat-label">Estados</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon purple">
            <Tag />
          </div>
          <div className="stat-info">
            <span className="stat-num">{tagsList.length}</span>
            <span className="stat-label">Categorias</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando contatos...</p>
          </div>
        ) : filteredEmpresas.length === 0 ? (
          <div className="empty-state">
            <Inbox size={64} />
            <h3>Nenhuma empresa encontrada</h3>
            <p>
              {temFiltrosAtivos
                ? "Tente ajustar os filtros para encontrar resultados."
                : 'Clique em "Novo Contato" para adicionar sua primeira empresa.'}
            </p>
          </div>
        ) : (
          <>
            <div className="cards-grid">
              {filteredEmpresas.map((emp) => {
                const cat = getCategoriaInfo(emp.tags);
                const initials = getInitials(emp.representante);
                const avatarColor = getAvatarColor(emp.empresa);
                const CategoriaIcon = getCategoriaIcon(emp.tags);

                return (
                  <div
                    key={emp.id}
                    className="card-comercial"
                    onClick={() => {
                      if (deletingId !== emp.id) {
                        setEditingEmpresa(emp);
                        setShowForm(true);
                      }
                    }}
                  >
                    {deletingId === emp.id ? (
                      /* Confirmação de exclusão */
                      <div
                        className="card-delete-confirm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 size={28} style={{ color: "#dc2626" }} />
                        <strong>Excluir contato?</strong>
                        <p>
                          Tem certeza que deseja excluir <br />
                          <strong>{emp.empresa}</strong>?
                        </p>
                        <div className="delete-actions">
                          <button
                            className="delete-btn cancel"
                            onClick={() => setDeletingId(null)}
                            disabled={deletingLoading}
                          >
                            Cancelar
                          </button>
                          <button
                            className="delete-btn confirm"
                            onClick={() => handleDelete(emp.id)}
                            disabled={deletingLoading}
                          >
                            {deletingLoading ? "Excluindo..." : "Sim, Excluir"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Category Badge + Delete Button */}
                        <div className="card-top">
                          <span className={`card-categoria cat-${cat.color}`}>
                            <CategoriaIcon />
                            {cat.label}
                          </span>
                          <button
                            className="card-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(emp.id);
                            }}
                            title="Excluir contato"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Company Name */}
                        <div className="card-empresa">
                          <h3>{emp.empresa}</h3>
                          {emp.site && (
                            <span
                              className="card-site clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUrl(`https://${emp.site}`);
                              }}
                            >
                              <Globe size={12} />
                              {emp.site}
                            </span>
                          )}
                        </div>

                        {/* Representative */}
                        <div className="card-representante">
                          <div className={`avatar ${avatarColor}`}>
                            {initials}
                          </div>
                          <div className="rep-info">
                            <span className="rep-name">
                              {emp.representante || "—"}
                            </span>
                            {emp.cargo && (
                              <span className="rep-cargo">{emp.cargo}</span>
                            )}
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="card-contato">
                          {emp.telefone && (
                            <span
                              className="contato-item clickable"
                              title="Abrir WhatsApp Web"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUrl(
                                  `https://wa.me/55${emp.telefone.replace(/\D/g, "")}`,
                                );
                              }}
                            >
                              <Phone size={15} />
                              {formatPhone(emp.telefone)}
                            </span>
                          )}
                          {emp.email && (
                            <span
                              className="contato-item clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUrl(`mailto:${emp.email}`);
                              }}
                            >
                              <Mail size={15} />
                              {emp.email}
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="card-divider" />

                        {/* Location */}
                        <div className="card-endereco">
                          <MapPin size={14} />
                          <span>
                            {[emp.cidade, emp.estado]
                              .filter(Boolean)
                              .join(", ")}
                            {emp.cidade && emp.endereco
                              ? ` — ${emp.endereco}`
                              : emp.endereco || ""}
                          </span>
                        </div>

                        {/* Event */}
                        {emp.evento && (
                          <div className="card-evento">
                            <Calendar size={13} />
                            {emp.evento}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {paginacao.total_paginas > 1 && (
              <div className="pagination-wrapper">
                <div className="pagination">
                  <button
                    className="btn-page"
                    disabled={paginacao.pagina === 1}
                    onClick={() =>
                      setFiltro((prev) => ({
                        ...prev,
                        pagina: (prev.pagina || 1) - 1,
                      }))
                    }
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página <strong>{paginacao.pagina}</strong> de{" "}
                    <strong>{paginacao.total_paginas}</strong> ·{" "}
                    <strong>{paginacao.total}</strong> registros
                  </span>
                  <button
                    className="btn-page"
                    disabled={paginacao.pagina === paginacao.total_paginas}
                    onClick={() =>
                      setFiltro((prev) => ({
                        ...prev,
                        pagina: (prev.pagina || 1) + 1,
                      }))
                    }
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <EmpresaForm
          empresa={editingEmpresa}
          onClose={() => {
            setShowForm(false);
            setEditingEmpresa(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingEmpresa(null);
            carregarDados();
          }}
        />
      )}
    </div>
  );
}
