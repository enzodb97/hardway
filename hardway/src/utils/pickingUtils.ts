// pickingUtils.ts

export const cargarTareasPicking = async (rol: string, username: string) => {
  let url = "/api/picking/tareas";
  if (rol === "Administrador") {
    url += "?rol=Administrador";
  } else {
    url += `?legajo=${username}`;
  }
  const res = await fetch(url);
  let data = await res.json();
  if (rol === "Administrador") {
    data = await Promise.all(
      data.map(async (tarea: any) => {
        try {
          const pickerRes = await fetch(
            `/api/pedidos/${tarea.numeroPedido}/picker-asignado`
          );
          const picker = await pickerRes.json();
          return { ...tarea, pickerAsignado: picker?.nombre || null };
        } catch {
          return { ...tarea, pickerAsignado: null };
        }
      })
    );
  }
  return data;
};

export const verPickingList = async (numeroPedido: string) => {
  const res = await fetch(`/api/picking/lista?numeroPedido=${numeroPedido}`);
  return await res.json();
};

export const completarTareaPicking = async (
  idAsignacion: number,
  numeroPedido: string
) => {
  const res = await fetch(`/api/picking/completar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idAsignacion, numeroPedido }),
  });
  if (!res.ok) throw new Error();
  return await res.json();
};
