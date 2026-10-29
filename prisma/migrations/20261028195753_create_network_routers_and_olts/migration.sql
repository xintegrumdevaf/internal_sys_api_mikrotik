-- CreateTable
CREATE TABLE "network_routers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8322,
    "username" TEXT NOT NULL DEFAULT 'ANGEL',
    "password_enc" TEXT NOT NULL,
    "password_iv" TEXT NOT NULL,
    "password_tag" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_routers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_olts" (
    "id" TEXT NOT NULL,
    "router_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT 'admin',
    "password_enc" TEXT NOT NULL,
    "password_iv" TEXT NOT NULL,
    "password_tag" TEXT NOT NULL,
    "slot" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_olts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "network_routers_name_key" ON "network_routers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "network_olts_router_id_name_key" ON "network_olts"("router_id", "name");

-- AddForeignKey
ALTER TABLE "network_olts" ADD CONSTRAINT "network_olts_router_id_fkey" FOREIGN KEY ("router_id") REFERENCES "network_routers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
