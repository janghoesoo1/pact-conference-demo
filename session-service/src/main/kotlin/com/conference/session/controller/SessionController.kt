package com.conference.session.controller

import com.conference.common.exception.ResourceNotFoundException
import com.conference.common.model.ApiResponse
import com.conference.common.model.Session
import com.conference.session.store.SessionStore
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI

@RestController
@RequestMapping("/sessions")
class SessionController(private val sessionStore: SessionStore) {

    @GetMapping
    fun getSessions(): ResponseEntity<ApiResponse<Session>> {
        val sessions = sessionStore.getSessions()
        return ResponseEntity.ok(ApiResponse(data = sessions))
    }

    @GetMapping("/{id}")
    fun getSession(@PathVariable id: Int): ResponseEntity<Session> {
        val session = sessionStore.getSession(id)
        return ResponseEntity.ok(session)
    }

    @PostMapping
    fun createSession(@RequestBody session: Session): ResponseEntity<Session> {
        val created = sessionStore.addSession(session)
        val location: URI = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id)
            .toUri()
        return ResponseEntity.created(location).body(created)
    }

    @PutMapping("/{id}")
    fun updateSession(
        @PathVariable id: Int,
        @RequestBody session: Session
    ): ResponseEntity<Void> {
        sessionStore.updateSession(id, session)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    fun deleteSession(@PathVariable id: Int): ResponseEntity<Void> {
        sessionStore.removeSession(id)
        return ResponseEntity.ok().build()
    }

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(ex: ResourceNotFoundException): ResponseEntity<Map<String, String>> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(mapOf("error" to (ex.message ?: "Not found")))
    }
}
