-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
-- We will sync Supabase Auth users to this table on first login or via trigger
create table if not exists users (
  id uuid primary key, -- matches auth.users.id
  email text not null unique,
  name text not null,
  role text not null check (role in ('DRIVER', 'RIDER')),
  created_at timestamp with time zone default now()
);

-- RIDES TABLE
create table if not exists rides (
  id bigserial primary key,
  driver_id uuid not null references users(id),
  source_city text not null,
  destination_city text not null,
  start_time timestamp with time zone not null,
  price_per_seat decimal(10, 2) not null,
  total_seats int not null,
  available_seats int not null,
  status text not null check (status in ('CREATED', 'STARTED', 'COMPLETED')),
  created_at timestamp with time zone default now()
);

-- RIDE PARTICIPANTS TABLE
create table if not exists ride_participants (
  id bigserial primary key,
  ride_id bigint not null references rides(id),
  rider_id uuid not null references users(id),
  joined_at timestamp with time zone default now(),
  fare_at_booking decimal(10, 2) not null,
  unique(ride_id, rider_id) -- prevent double booking
);
