import { useState, useEffect } from "react";
import type { Empresa, NovaEmpresa, AtualizaEmpresa } from "../types";
import { api } from "../api";
import { X, Save, Ban } from "lucide-react";

interface EmpresaFormProps {
  empresa?: Empresa | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmpresaForm({ empresa, onClose, onSuccess }: EmpresaFormProps) {
  const isEditing = !!empresa;
  const [formData, setFormData] = useState<NovaEmpresa | AtualizaEmpresa>({
    empresa: "",
    representante: "",
    cargo: "",
    telefone: "",
    email: "",
    site: "",
    cidade: "",
    estado: "",
    endereco: "",
    tags: "",
    evento: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (empresa) {
      setFormData({
        empresa: empresa.empresa,
        representante: empresa.representante || "",
        cargo: empresa.cargo || "",
        telefone: empresa.telefone || "",
        email: empresa.email || "",
        site: empresa.site || "",
        cidade: empresa.cidade || "",
        estado: empresa.estado || "",
        endereco: empresa.endereco || "",
        tags: empresa.tags || "",
        evento: empresa.evento || "",
      });
    }
  }, [empresa]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && empresa) {
        await api.atualizarEmpresa(empresa.id, formData as AtualizaEmpresa);
      } else {
        await api.criarEmpresa(formData as NovaEmpresa);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Editar Empresa" : "Nova Empresa"}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="empresa">Empresa *</label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  value={(formData as any).empresa || ""}
                  onChange={handleChange}
                  required
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="representante">Representante</label>
                <input
                  id="representante"
                  name="representante"
                  type="text"
                  value={(formData as any).representante || ""}
                  onChange={handleChange}
                  placeholder="Nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={(formData as any).cargo || ""}
                  onChange={handleChange}
                  placeholder="Ex: Gerente Comercial"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={(formData as any).telefone || ""}
                  onChange={handleChange}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={(formData as any).email || ""}
                  onChange={handleChange}
                  placeholder="contato@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  value={(formData as any).cidade || ""}
                  onChange={handleChange}
                  placeholder="Cidade"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <input
                  id="estado"
                  name="estado"
                  type="text"
                  value={(formData as any).estado || ""}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="endereco">Endereço</label>
                <textarea
                  id="endereco"
                  name="endereco"
                  value={(formData as any).endereco || ""}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="site">Site</label>
                <input
                  id="site"
                  name="site"
                  type="text"
                  value={(formData as any).site || ""}
                  onChange={handleChange}
                  placeholder="meusite.com.br"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags / Categoria</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={(formData as any).tags || ""}
                  onChange={handleChange}
                  placeholder="Hotel, Resort, ..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="evento">Evento</label>
                <input
                  id="evento"
                  name="evento"
                  type="text"
                  value={(formData as any).evento || ""}
                  onChange={handleChange}
                  placeholder="Ex: Avirp 2023"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <Ban size={16} />
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
