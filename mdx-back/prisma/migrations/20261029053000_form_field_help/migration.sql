ALTER TABLE "form_fields" ADD COLUMN "help" TEXT NOT NULL DEFAULT '';
ALTER TABLE "form_fields" ADD COLUMN "categories" "RegistrationCategory"[] NOT NULL DEFAULT ARRAY[]::"RegistrationCategory"[];
