// Hook para saber si un cliente es VIP
import { useEffect, useState } from "react";
import { getAllClientesVip, ClienteVip } from "./clientesVipUtils";

export function useClientesVip() {
  const [clientesVip, setClientesVip] = useState<ClienteVip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClientesVip().then((data) => {
      setClientesVip(data);
      setLoading(false);
    });
  }, []);

  // Devuelve un set para lookup rápido
  const vipIds = new Set(clientesVip.map((c) => c.idCliente));

  return { clientesVip, vipIds, loading };
}
