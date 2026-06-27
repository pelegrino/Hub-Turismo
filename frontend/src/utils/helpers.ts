import type { Categoria } from "../types";
import { getIconByName } from "./icons";

export function getCategoriaInfo(
  tags: string | null | undefined,
  categorias: Categoria[],
) {
  if (!tags)
    return { label: "Não informado", color: "gray", icon: "HelpCircle" };

  const tagList = tags.split(",").map((t) => t.trim().toLowerCase());

  for (const tag of tagList) {
    const found = categorias.find((c) => c.nome.toLowerCase() === tag);
    if (found) {
      return { label: found.nome, color: found.cor, icon: found.icone };
    }
  }

  return { label: tagList[0], color: "gray", icon: "Tag" };
}

export function getCategoriaIcon(
  tags: string | null | undefined,
  categorias: Categoria[],
) {
  if (!tags) return getIconByName("Tag");
  const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
  for (const tag of tagList) {
    const found = categorias.find((c) => c.nome.toLowerCase() === tag);
    if (found) return getIconByName(found.icone);
  }
  return getIconByName("Tag");
}

export function formatPhone(phone?: string | null) {
  if (!phone) return "";
  return phone
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
}

export function cleanPhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(str: string) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-amber-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
