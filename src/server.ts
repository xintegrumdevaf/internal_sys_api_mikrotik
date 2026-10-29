import "dotenv/config";
import app from "./app.js";
import { Logger } from "./shared/utils/logger.js";
import { NetworkTopologyService } from "./infrastructure/network/network-topology.service.js";

const PORT = process.env.PORT ?? 3001;

async function bootstrap() {
  try {
    await NetworkTopologyService.getTopology();
    Logger.info("Topología de red cargada y descifrada desde BD");
  } catch (err: any) {
    Logger.error(`Error cargando topología inicial: ${err.message}; utilizando respaldo`);
  }

  app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err: any) => {
  Logger.error(`Error fatal iniciando servidor: ${err.message}`);
  process.exit(1);
});
