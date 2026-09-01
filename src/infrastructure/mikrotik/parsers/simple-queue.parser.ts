export interface ParsedSimpleQueueEntry {
  found: boolean
  name: string | null
  contractId: string | null
  clientName: string | null
  target: string | null
  maxLimit: string | null
  uploadLimit: string | null
  downloadLimit: string | null
  disabled: boolean
  dynamic: boolean
  invalid: boolean
}

export function parseMikrotikSimpleQueue(rawOutput: string, targetIp: string): ParsedSimpleQueueEntry {
  const lines = rawOutput.split(/\r?\n/)
  const logicalLines: string[] = []
  let current = ""

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("Flags:") || trimmed.startsWith("[") || trimmed.startsWith("#")) {
      continue
    }
    // Si la línea empieza con sangría/espacios, es continuación de la anterior
    if (/^\s{2,}/.test(line) && current) {
      current += " " + trimmed
    } else {
      if (current) logicalLines.push(current)
      current = trimmed
    }
  }
  if (current) logicalLines.push(current)

  let found = false
  let name: string | null = null
  let contractId: string | null = null
  let clientName: string | null = null
  let target: string | null = null
  let maxLimit: string | null = null
  let uploadLimit: string | null = null
  let downloadLimit: string | null = null
  let disabled = false
  let dynamic = false
  let invalid = false

  for (const line of logicalLines) {
    if (line.includes(targetIp)) {
      found = true

      // Flags al inicio de la línea (ej: "15   ", "15 X ", "0 XD ")
      const flagMatch = line.match(/^\d+\s+([XID\s]+)?name=/)
      if (flagMatch && flagMatch[1]) {
        const flags = flagMatch[1]
        disabled = flags.includes("X")
        invalid = flags.includes("I")
        dynamic = flags.includes("D")
      }

      // name="..."
      const nameMatch = line.match(/name="([^"]+)"/)
      if (nameMatch) {
        name = nameMatch[1] ?? null
        // Formato frecuente: "1404 - MONDOL MEJIA.WILLIAM SIDNEY."
        const splitName = name ? name.match(/^(\d+)\s*-\s*(.+)$/) : null
        if (splitName) {
          contractId = splitName[1] ?? null
          clientName = (splitName[2] ?? "").replace(/\.+$/, "").trim()
        } else {
          clientName = name?.trim() ?? null
        }
      }

      // target=...
      const targetMatch = line.match(/target=([^\s]+)/)
      if (targetMatch) {
        target = targetMatch[1] ?? null
      }

      // max-limit=upload/download
      const limitMatch = line.match(/max-limit=([^\s]+)/)
      if (limitMatch) {
        maxLimit = limitMatch[1] ?? null
        if (maxLimit) {
          const [up, down] = maxLimit.split("/")
          uploadLimit = up ?? null
          downloadLimit = down ?? null
        }
      }

      break
    }
  }

  return {
    found,
    name,
    contractId,
    clientName,
    target,
    maxLimit,
    uploadLimit,
    downloadLimit,
    disabled,
    dynamic,
    invalid,
  }
}
