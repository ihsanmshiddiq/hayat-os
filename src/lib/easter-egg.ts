const SPECIAL_NAMES = ["ihsan muhammad shidiq", "tantri nuraeni"];

export function getSpecialProfile(name?: string | null) {
  const normalized = name?.trim().toLocaleLowerCase("id-ID") ?? "";
  if (normalized === SPECIAL_NAMES[0]) return { kind: "ihsan" as const, title: "Penjaga Hayat", message: "Terima kasih telah merawat perjalanan kecil ini.", accent: "emerald" };
  if (normalized === SPECIAL_NAMES[1]) return { kind: "tantri" as const, title: "Ruang yang lembut", message: "Semoga setiap hal kecil di sini membuat harimu terasa lebih ringan.", accent: "rose" };
  return null;
}
