import { invoke } from "@tauri-apps/api/core";
import type {
  Empresa,
  NovaEmpresa,
  AtualizaEmpresa,
  EmpresaFiltro,
  EmpresasPaginadas,
} from "./types";

export const api = {
  async listarEmpresas(filtro?: EmpresaFiltro): Promise<EmpresasPaginadas> {
    return await invoke("listar_empresas", { filtro });
  },

  async buscarEmpresa(id: number): Promise<Empresa | null> {
    return await invoke("buscar_empresa", { id });
  },

  async criarEmpresa(nova: NovaEmpresa): Promise<Empresa> {
    return await invoke("criar_empresa", { nova });
  },

  async atualizarEmpresa(
    id: number,
    atualiza: AtualizaEmpresa,
  ): Promise<Empresa> {
    return await invoke("atualizar_empresa", { id, atualiza });
  },

  async deletarEmpresa(id: number): Promise<boolean> {
    return await invoke("deletar_empresa", { id });
  },

  async listarCidades(): Promise<string[]> {
    return await invoke("listar_cidades");
  },

  async listarEstados(): Promise<string[]> {
    return await invoke("listar_estados");
  },

  async listarEventos(): Promise<string[]> {
    return await invoke("listar_eventos");
  },

  async listarTags(): Promise<string[]> {
    return await invoke("listar_tags");
  },

  async exportarBackup(caminho: string): Promise<string> {
    return await invoke("exportar_backup", { caminho });
  },

  async importarBackup(caminho: string): Promise<string> {
    return await invoke("importar_backup", { caminho });
  },
};
