import { MikrotikClientStatus } from "../../../domain/mikrotik/enums/mikrotik-client-status.enum.js"

export interface ParsedAddressListEntry {
  found: boolean
  list: string | null
  address: string
  clientName: string | null
  creationTime: string | null
  status: MikrotikClientStatus
  canBeReactivated: boolean
  reason: string
}

export function parseMikrotikAddressList(rawOutput: string, targetIp: string): ParsedAddressListEntry {
  const lines = rawOutput
    .split("\n")
    .map(l => l.replace(/\r/g, "").trim())
    .filter(Boolean)

  let clientName: string | null = null
  let listName: string | null = null
  let creationTime: string | null = null
  let found = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // Comentario del cliente: ;;; NOMBRE CLIENTE (puede venir precedido por el índice "0   ;;; NOMBRE")
    if (line.includes(";;;")) {
      clientName = line.split(";;;")[1]?.trim() ?? null
      continue
    }

    // Formato de tabla: # LIST ADDRESS CREATION-TIME
    // Ejemplo: 1 Habilitado 10.100.11.19 2026-08-26 16:48:24
    // Ejemplo: 0 CORTADO 10.100.14.6 2026-08-24 15:59:48
    const tableMatch = line.match(
      /^(?:\d+\s+)?(?:[XDI*]{1,4}\s+)?([A-Za-z0-9_-]+)\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\s+(.+))?$/
    )

    if (tableMatch && tableMatch[2] === targetIp) {
      found = true
      listName = tableMatch[1] ?? null
      creationTime = tableMatch[3]?.trim() ?? null
      break
    }

    // Formato detalle: list="CORTADO" address=10.100.14.6 creation-time=...
    const detailMatch = line.match(/list="?([^"\s]+)"?\s+address=([0-9.]+)(?:\s+creation-time=(.+))?/i)
    if (detailMatch && detailMatch[2] === targetIp) {
      found = true
      listName = detailMatch[1] ?? null
      creationTime = detailMatch[3]?.trim() ?? null
      break
    }
  }

  if (!found || !listName) {
    return {
      found: false,
      list: null,
      address: targetIp,
      clientName: null,
      creationTime: null,
      status: MikrotikClientStatus.NOT_FOUND,
      canBeReactivated: true,
      reason: `La IP ${targetIp} no está registrada en ninguna address-list del firewall MikroTik.`
    }
  }

  const normalizedList = listName.toLowerCase()

  if (normalizedList.includes("habilitad") || normalizedList === "activo" || normalizedList === "active") {
    return {
      found: true,
      list: listName,
      address: targetIp,
      clientName,
      creationTime,
      status: MikrotikClientStatus.HABILITADO,
      canBeReactivated: false,
      reason: `El cliente ${clientName ? `(${clientName}) ` : ""}se encuentra Habilitado en la lista '${listName}'.`
    }
  }

  if (
    normalizedList.includes("cortad") ||
    normalizedList.includes("moros") ||
    normalizedList.includes("suspend") ||
    normalizedList.includes("bloque")
  ) {
    return {
      found: true,
      list: listName,
      address: targetIp,
      clientName,
      creationTime,
      status: MikrotikClientStatus.CORTADO,
      canBeReactivated: true,
      reason: `El cliente ${clientName ? `(${clientName}) ` : ""}se encuentra Cortado en la lista '${listName}'.`
    }
  }

  return {
    found: true,
    list: listName,
    address: targetIp,
    clientName,
    creationTime,
    status: MikrotikClientStatus.UNKNOWN,
    canBeReactivated: true,
    reason: `El cliente ${clientName ? `(${clientName}) ` : ""}está en una lista personalizada: '${listName}'.`
  }
}
