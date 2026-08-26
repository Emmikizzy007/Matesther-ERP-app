-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('SCHOOL', 'COMPANY', 'ORGANIZATION', 'INDIVIDUAL', 'OTHER');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_type" "public"."CustomerType" NOT NULL DEFAULT 'SCHOOL',
    "name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "address" TEXT,
    "contact_person" VARCHAR(150),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_contacts" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150),
    "position" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "category_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "sku" VARCHAR(50),
    "description" TEXT,
    "unit" VARCHAR(30) NOT NULL DEFAULT 'piece',
    "selling_price" DECIMAL(14,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_organization_id_is_active_idx" ON "public"."customers"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "customers_organization_id_customer_type_idx" ON "public"."customers"("organization_id", "customer_type");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organization_id_name_key" ON "public"."customers"("organization_id", "name");

-- CreateIndex
CREATE INDEX "customer_contacts_organization_id_idx" ON "public"."customer_contacts"("organization_id");

-- CreateIndex
CREATE INDEX "customer_contacts_customer_id_idx" ON "public"."customer_contacts"("customer_id");

-- CreateIndex
CREATE INDEX "product_categories_organization_id_idx" ON "public"."product_categories"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_organization_id_name_key" ON "public"."product_categories"("organization_id", "name");

-- CreateIndex
CREATE INDEX "products_organization_id_is_active_idx" ON "public"."products"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "products_organization_id_category_id_idx" ON "public"."products"("organization_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_organization_id_name_key" ON "public"."products"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_organization_id_sku_key" ON "public"."products"("organization_id", "sku");

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_contacts" ADD CONSTRAINT "customer_contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
