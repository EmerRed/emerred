import type { Afectado, PuntoAfectado } from '@/domain/types';

export function aggregateByLocation(afectados: Afectado[]): PuntoAfectado[] {
  const groups = new Map<string, Afectado[]>();

  for (const a of afectados) {
    const key = `${a.lat.toFixed(5)},${a.long.toFixed(5)}`;
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([key, list]) => {
    const lat = list[0].lat;
    const long = list[0].long;
    const conteo = list.length;
    const promedio = list.reduce((s, a) => s + a.potencia_red_movil, 0) / conteo;
    const celulares = list.map(a => a.numero_celular);
    const conMesh = list.filter(a => a.coneccion_mesh).length;

    return {
      id: key,
      lat,
      long,
      conteo,
      promedio: Math.round(promedio * 10) / 10,
      celulares,
      conMesh,
    };
  });
}
