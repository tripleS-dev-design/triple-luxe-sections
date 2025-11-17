-- CreateTable
CREATE TABLE "public"."ShopFeature" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopFeature_pkey" PRIMARY KEY ("id")
);
