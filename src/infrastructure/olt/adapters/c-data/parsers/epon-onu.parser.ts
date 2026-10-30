export interface EponOnuInfo {
  port: number
  onuId: number
  mac: string
  state: string
  softwareVer?: string | undefined
  template?: string | undefined
}

/**
 * Parses the tabular output of "show olt <pon> all" from C-DATA EPON OLTs.
 *
 * Example output:
 *   Port  ONU  MAC                State      Software-Ver  Template
 *   1     1    80-f7-a6-6c-b4-e0  online     V1.3.8        0(system)
 *   1     3    70-a5-6a-ff-93-b5  powerdown                0(system)
 */
export function parseEponOnuTable(output: string): EponOnuInfo[] {
  const result: EponOnuInfo[] = []
  const lines = output.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(
      /^(\d+)\s+(\d+)\s+([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})\s+([a-zA-Z]+)(?:\s+([\w\.\-]+))?(?:\s+(.+))?/
    )
    if (match && match[1] && match[2] && match[3] && match[4]) {
      result.push({
        port: parseInt(match[1], 10),
        onuId: parseInt(match[2], 10),
        mac: match[3].toLowerCase().replace(/-/g, ":"),
        state: match[4].toLowerCase(),
        softwareVer: match[5]?.trim(),
        template: match[6]?.trim()
      })
    }
  }

  return result
}

/**
 * Finds an ONU by its MAC address (supporting colons, dashes, or plain 12 hex digits)
 * or by its numeric ONU ID.
 */
export function findEponOnu(onus: EponOnuInfo[], query: string): EponOnuInfo | undefined {
  if (!query) return undefined
  const cleaned = query.replace(/[:\-\.]/g, "").toLowerCase().trim()

  // 1. Match by MAC address
  const byMac = onus.find(o => o.mac.replace(/[:\-\.]/g, "").toLowerCase() === cleaned)
  if (byMac) return byMac

  // 2. Match by ONU ID (if query is purely digits)
  if (/^\d+$/.test(query.trim())) {
    const id = parseInt(query.trim(), 10)
    const byId = onus.find(o => o.onuId === id)
    if (byId) return byId
  }

  return undefined
}
