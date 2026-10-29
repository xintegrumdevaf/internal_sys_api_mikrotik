export const showEponOltAll = (pon: string | number): string => {
  const cleanPon = String(pon).includes("/") ? String(pon).split("/").pop() ?? String(pon) : String(pon)
  const numericPort = cleanPon.replace(/[^\d]/g, "") || "1"
  return `show olt ${numericPort} all`
}
