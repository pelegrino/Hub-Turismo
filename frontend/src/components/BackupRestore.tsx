import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { Download, Upload, AlertTriangle, CheckCircle, X, FileJson } from "lucide-react";

interface BackupRestoreProps {
  onSuccess: () => void;
}

export function BackupRestore({ onSuccess }: BackupRestoreProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmImport, setConfirmImport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setConfirmImport(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleExport = async () => {
    try {
      // Dynamically import the dialog module
      const { save } = await import("@tauri-apps/plugin-dialog");
      const path = await save({
        defaultPath: `hubturismo-backup-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!path) return;

      setLoading(true);
      setMessage(null);

      const result = await api.exportarBackup(path);
      setMessage({ type: "success", text: result });
      setIsOpen(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao exportar backup",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const path = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
        multiple: false,
      });

      if (!path) return;

      setLoading(true);
      setMessage(null);

      const result = await api.importarBackup(path as string);
      setMessage({ type: "success", text: result });
      setConfirmImport(false);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao importar backup",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        className="btn-header-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Backup e Restauração"
      >
        <FileJson size={18} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
            minWidth: 320,
            zIndex: 100,
            overflow: "hidden",
            animation: "fadeIn 0.12s ease",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong style={{ fontSize: 15, color: "#0f172a" }}>
              Backup & Restauração
            </strong>
            <button
              onClick={() => {
                setIsOpen(false);
                setConfirmImport(false);
              }}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 16 }}>
            {message && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.4,
                  marginBottom: 12,
                  background:
                    message.type === "success" ? "#ecfdf5" : "#fef2f2",
                  border:
                    message.type === "success"
                      ? "1px solid #a7f3d0"
                      : "1px solid #fecaca",
                  color:
                    message.type === "success" ? "#065f46" : "#991b1b",
                  whiteSpace: "pre-line",
                }}
              >
                {message.type === "success" ? (
                  <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {!confirmImport ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="btn-backup"
                >
                  <Download size={16} />
                  Exportar Backup
                  <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 400 }}>
                    Salvar dados em arquivo JSON
                  </span>
                </button>

                <button
                  onClick={() => setConfirmImport(true)}
                  disabled={loading}
                  className="btn-backup btn-import"
                >
                  <Upload size={16} />
                  Importar Backup
                  <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 400 }}>
                    Restaurar dados de um arquivo
                  </span>
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#92400e",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    <strong>Atenção!</strong> A importação substituirá TODOS os dados
                    atuais pelos dados do arquivo de backup. Esta ação não pode ser
                    desfeita.
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setConfirmImport(false)}
                    className="btn-backup-cancel"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    className="btn-backup-confirm"
                    disabled={loading}
                  >
                    {loading ? "Importando..." : "Confirmar Importação"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .btn-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          color: #fff;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-header-icon:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }
        .btn-backup {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #1e293b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .btn-backup:hover:not(:disabled) {
          background: #eef2ff;
          border-color: #c7d2fe;
        }
        .btn-backup:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-import { border-color: #dbeafe; background: #f0f7ff; }
        .btn-import:hover:not(:disabled) { border-color: #93c5fd; background: #dbeafe; }
        .btn-backup-cancel {
          flex: 1;
          padding: 10px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-backup-cancel:hover { background: #f1f5f9; }
        .btn-backup-confirm {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          background: #dc2626;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-backup-confirm:hover:not(:disabled) { background: #b91c1c; }
        .btn-backup-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
