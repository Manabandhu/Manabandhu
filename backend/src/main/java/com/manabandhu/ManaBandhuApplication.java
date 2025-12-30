package com.manabandhu;

import com.google.cloud.spring.autoconfigure.core.GcpContextAutoConfiguration;
import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration;
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
    GcpContextAutoConfiguration.class,
    GcpFirestoreAutoConfiguration.class,
    GcpStorageAutoConfiguration.class
})
@EnableCaching
@EnableJpaAuditing
@EnableScheduling
public class ManaBandhuApplication {
    public static void main(String[] args) {
        SpringApplication.run(ManaBandhuApplication.class, args);
    }
}
