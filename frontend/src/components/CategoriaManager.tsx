import { useState, useEffect } from "react";
import { api } from "../api";
import type { Categoria } from "../types";
import {
  AVAILABLE_ICONS,
  CATEGORIA_CORES,
  getIconByName,
} from "../utils/icons";
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings2,
} from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoriaManager({ onClose, onSuccess }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState("Tag");
  const [cor, setCor] = useState("gray");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadCategorias = async () => {
    try {
      const data = await api.listarCategorias();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNome("");
    setIcone("Tag");
    setCor("gray");
    setMessage(null);
  };

  const handleEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setNome(cat.nome);
    setIcone(cat.icone);
    setCor(cat.cor);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setMessage({ type: "error", text: "O nome da categoria é obrigatório." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        await api.atualizarCategoria(editingId, nome.trim(), icone, cor);
      } else {
        await api.criarCategoria(nome.trim(), icone, cor);
      }
      setMessage({ type: "success", text: "Categoria salva com sucesso!" });
      resetForm();
      loadCategorias();
      onSuccess();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletarCategoria(id);
      setDeletingId(null);
      loadCategorias();
      onSuccess();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const CoresDisponiveis = CATEGORIA_CORES;
  const IconesDisponiveis = AVAILABLE_ICONS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal cat-manager-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <Settings2 size={20} />
            <h2>Gerenciar Categorias</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`cat-message cat-${message.type}`}>
              {message.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <div className="cat-form">
            <div className="cat-form-row">
              <div className="cat-form-group" style={{ flex: 1 }}>
                <label>Nome da categoria</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Restaurante"
                />
              </div>
              <div className="cat-form-group" style={{ flex: 1 }}>
                <label>Cor</label>
                <div className="cat-color-select">
                  {CoresDisponiveis.map((c) => (
                    <button
                      key={c.name}
                      className={`cat-color-btn ${c.class} ${
                        cor === c.name ? "selected" : ""
                      }`}
                      onClick={() => setCor(c.name)}
                      title={c.label}
                    >
                      {cor === c.name && <CheckCircle size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cat-form-group">
              <label>Ícone</label>
              <div className="cat-icon-grid">
                {IconesDisponiveis.map((ic) => {
                  const IconComp = getIconByName(ic.name);
                  return (
                    <button
                      key={ic.name}
                      className={`cat-icon-btn ${
                        icone === ic.name ? "selected" : ""
                      }`}
                      onClick={() => setIcone(ic.name)}
                      title={ic.label}
                    >
                      <IconComp size={18} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cat-form-actions">
              {editingId && (
                <button className="cat-btn-cancel" onClick={resetForm}>
                  Nova Categoria
                </button>
              )}
              <button
                className="cat-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />
                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Atualizar Categoria"
                    : "Adicionar Categoria"}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="cat-list">
            {loading ? (
              <div className="loading-state" style={{ padding: 20 }}>
                <div className="spinner" />
              </div>
            ) : categorias.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <p>Nenhuma categoria cadastrada.</p>
              </div>
            ) : (
              categorias.map((cat) => {
                const IconComp = getIconByName(cat.icone);
                return (
                  <div key={cat.id} className="cat-list-item">
                    {deletingId === cat.id ? (
                      <div className="cat-delete-confirm">
                        <span>
                          Excluir <strong>{cat.nome}</strong>?
                        </span>
                        <div className="cat-delete-actions">
                          <button
                            className="cat-btn-sm"
                            onClick={() => setDeletingId(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            className="cat-btn-sm cat-btn-danger"
                            onClick={() => handleDelete(cat.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="cat-list-left">
                          <span className={`cat-list-icon cat-${cat.cor}`}>
                            <IconComp size={16} />
                          </span>
                          <span className="cat-list-name">{cat.nome}</span>
                        </div>
                        <div className="cat-list-actions">
                          <button
                            className="cat-btn-icon"
                            onClick={() => handleEdit(cat)}
                            title="Editar"
                          >
                            <Settings2 size={14} />
                          </button>
                          <button
                            className="cat-btn-icon cat-btn-icon-danger"
                            onClick={() => setDeletingId(cat.id)}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
