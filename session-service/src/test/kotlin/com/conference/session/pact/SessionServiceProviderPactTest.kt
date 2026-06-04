package com.conference.session.pact

import au.com.dius.pact.provider.junit5.HttpTestTarget
import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactFolder
import com.conference.session.store.SessionStore
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort

@Provider("SessionService")
@PactFolder("../attendee-service/build/pacts")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SessionServiceProviderPactTest {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var sessionStore: SessionStore

    @BeforeEach
    fun setUp(context: PactVerificationContext) {
        context.target = HttpTestTarget("localhost", port)
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider::class)
    fun pactVerificationTestTemplate(context: PactVerificationContext) {
        context.verifyInteraction()
    }

    @State("세션 ID 1이 존재함")
    fun sessionWithId1Exists() {
        // SessionStore 초기 데이터에 ID 1이 이미 존재하므로 추가 설정 불필요
    }

    @State("세션 목록이 존재함")
    fun sessionsExist() {
        // 초기 데이터 3건이 이미 로드되어 있으므로 추가 설정 불필요
    }

    @State("세션 ID 999가 존재하지 않음")
    fun sessionWithId999DoesNotExist() {
        // 999번 세션은 존재하지 않으므로 추가 설정 불필요
    }
}
