const SPECIAL_NAMES = ["ihsan muhammad shidiq", "tantri nuraeni"];

export function getSpecialProfile(name?: string | null) {
  const normalized = name?.trim().toLocaleLowerCase("id-ID") ?? "";
  if (normalized === SPECIAL_NAMES[0]) return { title: "Penjaga Hayat", message: "Terima kasih telah merawat perjalanan kecil ini.", accent: "emerald" };
  if (normalized === SPECIAL_NAMES[1]) return { title: "Cahaya Hayat", message: "Kehadiranmu membuat ruang ini terasa lebih hangat.", accent: "rose" };
  return null;
}
