package com.conference.attendee.controller

import com.conference.attendee.client.SessionClient
import com.conference.attendee.store.AttendeeStore
import com.conference.common.exception.ResourceNotFoundException
import com.conference.common.model.ApiResponse
import com.conference.common.model.Attendee
import com.conference.common.model.Session
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/attendees")
class AttendeeController(
    private val attendeeStore: AttendeeStore,
    private val sessionClient: SessionClient
) {

    @GetMapping
    fun getAttendees(): ApiResponse<Attendee> {
        val attendees = attendeeStore.getAttendees()
        return ApiResponse(data = attendees)
    }

    @GetMapping("/{id}")
    fun getAttendee(@PathVariable id: Int): ResponseEntity<Attendee> {
        return try {
            ResponseEntity.ok(attendeeStore.getAttendee(id))
        } catch (e: ResourceNotFoundException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/{id}/sessions")
    fun getAttendeeSessions(@PathVariable id: Int): ResponseEntity<ApiResponse<Session>> {
        return try {
            attendeeStore.getAttendee(id)
            val sessions = sessionClient.getSessions()
            ResponseEntity.ok(ApiResponse(data = sessions))
        } catch (e: ResourceNotFoundException) {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    fun addAttendee(@RequestBody attendee: Attendee): ResponseEntity<Attendee> {
        val saved = attendeeStore.addAttendee(attendee)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved)
    }

    @PutMapping("/{id}")
    fun updateAttendee(
        @PathVariable id: Int,
        @RequestBody attendee: Attendee
    ): ResponseEntity<Void> {
        return try {
            attendeeStore.updateAttendee(id, attendee)
            ResponseEntity.noContent().build()
        } catch (e: ResourceNotFoundException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    fun removeAttendee(@PathVariable id: Int): ResponseEntity<Void> {
        return try {
            attendeeStore.removeAttendee(id)
            ResponseEntity.ok().build()
        } catch (e: ResourceNotFoundException) {
            ResponseEntity.notFound().build()
        }
    }
}
