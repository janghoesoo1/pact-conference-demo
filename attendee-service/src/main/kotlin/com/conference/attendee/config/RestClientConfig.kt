package com.conference.attendee.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class RestClientConfig {

    @Bean
    fun sessionRestClient(
        @Value("\${session-service.url:http://localhost:8081}") baseUrl: String
    ): RestClient = RestClient.builder()
        .baseUrl(baseUrl)
        .build()
}
