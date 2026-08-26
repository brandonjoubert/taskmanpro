package com.taskmanpro.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.Instant
import java.time.LocalDate

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String?,
    val isRecurrent: Boolean = false,
    val dueDate: LocalDate,
    val recurrenceInterval: Int = 0,
    val importance: Int,
    val risk: Int,
    val isCompleted: Boolean = false,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
)
