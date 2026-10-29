import crypto from "node:crypto";
import { Logger } from "../../shared/utils/logger.js";

export interface EncryptedSecret {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Servicio de bóveda criptográfica con cifrado autenticado AES-256-GCM.
 * Protege credenciales de red (MikroTik SSH, OLT telnet/SSH) en reposo.
 */
export class VaultService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 12; // 96 bits recomendado para GCM
  private static readonly TAG_LENGTH = 16; // 128 bits auth tag

  private static getMasterKey(): Buffer {
    const rawKey = process.env.NETWORK_VAULT_KEY;
    if (!rawKey) {
      Logger.warn(
        "NETWORK_VAULT_KEY no está configurada en .env; utilizando clave derivada local de respaldo para desarrollo",
        "VaultService"
      );
    }
    const seed = rawKey || "mikrotik_isp_vault_default_secret_key_32b_salt_2026";
    return crypto.createHash("sha256").update(seed).digest();
  }

  /**
   * Cifra una cadena en texto plano usando AES-256-GCM.
   */
  static encrypt(plainText: string): EncryptedSecret {
    if (!plainText) {
      return { ciphertext: "", iv: "", tag: "" };
    }
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.getMasterKey(), iv);
    let ciphertext = cipher.update(plainText, "utf8", "hex");
    ciphertext += cipher.final("hex");
    const tag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Descifra un secreto usando AES-256-GCM y valida el tag de autenticación.
   */
  static decrypt(secret: EncryptedSecret): string {
    if (!secret.ciphertext || !secret.iv || !secret.tag) {
      return "";
    }
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      this.getMasterKey(),
      Buffer.from(secret.iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(secret.tag, "hex"));
    let decrypted = decipher.update(secret.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Retorna una representación enmascarada para APIs de lectura.
   */
  static mask(): string {
    return "••••••••";
  }
}
