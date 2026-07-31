const TANTRI_EMAIL = "tantrin268@gmail.com";
const TANTRI_NAME = "tantri nuraeni";

/** The personal theme is deliberately available only to its intended account. */
export function getSpecialProfile(name?: string | null, email?: string | null) {
  const normalizedName = name?.trim().toLocaleLowerCase("id-ID") ?? "";
  const normalizedEmail = email?.trim().toLocaleLowerCase("id-ID") ?? "";
  if (normalizedName === TANTRI_NAME && normalizedEmail === TANTRI_EMAIL) {
    return { kind: "tantri" as const, title: "Ruang yang lembut", message: "Semoga setiap hal kecil di sini membuat harimu terasa lebih ringan.", accent: "rose" };
  }
  return null;
}
