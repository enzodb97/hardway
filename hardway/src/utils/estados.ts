import React from 'react';
import { FiClipboard, FiCreditCard, FiCheckSquare, FiTruck, FiHome, FiXCircle } from 'react-icons/fi';

export const estadosPedido: Array<{
  id: number;
  key: string;
  label: string;
  descripcion: string;
  Icon: React.ComponentType<any>;
}> = [
  { id: 1, key: 'creado', label: 'En Curso', descripcion: 'Pedido creado', Icon: FiClipboard },
  { id: 2, key: 'pago', label: 'Pendiente de Pago', descripcion: 'Esperando pago', Icon: FiCreditCard },
  { id: 3, key: 'abonado', label: 'Abonado', descripcion: 'Pago confirmado', Icon: FiCheckSquare },
  { id: 4, key: 'enviado', label: 'Despachado', descripcion: 'En camino', Icon: FiTruck },
  { id: 5, key: 'entregado', label: 'Finalizado', descripcion: 'Entregado', Icon: FiHome },
];

export function estadoIdToIndex(id: number): number | null {
  const idx = estadosPedido.findIndex((e) => e.id === id);
  return idx >= 0 ? idx : null;
}

export function findIndexByLabelOrKey(input?: string): number | null {
  if (!input) return null;
  const s = normalize(input);
  // try key match first
  const byKey = estadosPedido.findIndex((e) => normalize(e.key) === s);
  if (byKey >= 0) return byKey;
  // try label match
  const byLabel = estadosPedido.findIndex((e) => normalize(e.label) === s || normalize(e.descripcion) === s);
  if (byLabel >= 0) return byLabel;
  // try substring match
  const bySub = estadosPedido.findIndex((e) => normalize(e.label).includes(s) || normalize(e.descripcion).includes(s) || normalize(e.key).includes(s));
  if (bySub >= 0) return bySub;
  return null;
}

export function normalize(str: string) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

export function isCancelledById(id?: number) {
  return id === 6;
}
