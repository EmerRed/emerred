export async function getAddress(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
        },
      }
    );
    const json = await res.json();
    return json.display_name || 'Dirección no disponible';
  } catch {
    return 'Dirección no disponible';
  }
}
