export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type Database = { public: { Tables: { [key: string]: any }, Enums: { [key: string]: any } } }
export type Tables<T extends keyof Database['public']['Tables']> = any
export type Enums<T extends keyof Database['public']['Enums']> = any
