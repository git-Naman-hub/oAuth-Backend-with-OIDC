CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"application_name" varchar(300),
	"application_url" varchar(200),
	"redirect_uri" varchar(200),
	"salt" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "applications_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "authorize_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"redirect_uri" varchar(200),
	"expires_at" timestamp,
	CONSTRAINT "authorize_codes_code_unique" UNIQUE("code"),
	CONSTRAINT "authorize_codes_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(45) NOT NULL,
	"last_name" varchar(45),
	"email" varchar(322) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"password" varchar(66),
	"salt" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorize_codes" ADD CONSTRAINT "authorize_codes_client_id_applications_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."applications"("client_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorize_codes" ADD CONSTRAINT "authorize_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;