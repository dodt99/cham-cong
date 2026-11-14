package com.chamcong;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaRepositories(considerNestedRepositories = true)   // repository danh mục khai báo lồng trong CatalogRepositories
public class ChamCongApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChamCongApplication.class, args);
    }
}
