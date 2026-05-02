import {pgTable,uuid,varchar,boolean,text,timestamp} from "drizzle-orm/pg-core"
import { Client } from "pg"

export const usersTable = pgTable('users',{
    id: uuid('id').primaryKey().defaultRandom(),

    firstName: varchar('first_name',{length:45}).notNull(),
    lastName: varchar('last_name',{length:45}),

    email: varchar('email',{length:322}).notNull().unique(),
    emailVerified: boolean('email_verified').default(false),

    password: varchar('password',{length:66}),
    salt: text('salt'),
    
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(()=>new Date())
})

export const applicationsTable = pgTable('applications',{
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(()=>usersTable.id),

    clientId: text('client_id').unique().notNull(),
    clientSecret: text('client_secret').notNull(),

    applicationName: varchar('application_name',{length:300}),
    applicationUrl: varchar('application_url',{length:200}),
    redirectUri: varchar('redirect_uri',{length:200}),

    salt: text('salt').notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(()=>new Date())
})

export const authorizeCodesTable = pgTable('authorize_codes',{
    id: uuid('id').primaryKey().defaultRandom(),

    code: text('code').notNull().unique(),

    clientId: text('client_id').notNull().unique().references(()=>applicationsTable.clientId),
    userId: uuid('user_id').notNull().references(()=>usersTable.id),

    redirectUri: varchar('redirect_uri',{length:200}),
 
    expiresAt: timestamp('expires_at')
   
})