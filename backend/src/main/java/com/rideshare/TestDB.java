package com.rideshare;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDB {
    public static void main(String[] args) {
        String[] regions = {
            "ap-south-1",
            "us-east-1",
            "ap-southeast-1",
            "eu-central-1",
            "eu-west-1",
            "eu-west-2",
            "us-west-1",
            "us-west-2"
        };
        
        String user = "postgres.sxdkedopdneocnbomjbi";
        String pass = "superrohith007";
        
        for (String region : regions) {
            String url = "jdbc:postgresql://aws-0-" + region + ".pooler.supabase.com:6543/postgres";
            System.out.println("Testing region: " + region);
            try {
                Connection conn = DriverManager.getConnection(url, user, pass);
                System.out.println("SUCCESS! Connected to " + region);
                conn.close();
                return;
            } catch (SQLException e) {
                System.out.println("Failed: " + e.getMessage());
            }
        }
        System.out.println("All regions failed.");
    }
}
