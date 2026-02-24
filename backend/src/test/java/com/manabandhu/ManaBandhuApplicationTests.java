package com.manabandhu;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:contextloads;DB_CLOSE_DELAY=-1")
class ManaBandhuApplicationTests {

    @Test
    void contextLoads() {
    }
}
