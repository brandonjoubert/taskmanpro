package com.taskmanpro.app.domain

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

data class TaskInput(
    val title: String,
    val description: String?,
    val isRecurrent: Boolean,
    val dueDate: LocalDate,
    val recurrenceInterval: Int,
    val importance: Int,
    val risk: Int,
)

data class ValidationResult(
    val isValid: Boolean,
    val errors: Map<String, String>,
    val input: TaskInput?,
)

object TaskValidator {

    const val MAX_TITLE_LENGTH = 100
    const val MIN_SCORE = 1
    const val MAX_SCORE = 5

    private val dateFormat = DateTimeFormatter.ISO_LOCAL_DATE

    /**
     * Port of `validate_task_form` from the Flask app, plus the same field
     * error keys used by the web UI. Returns field-keyed errors and a parsed
     * TaskInput when the form is valid.
     */
    fun validate(
        titleRaw: String,
        descriptionRaw: String,
        dueDateRaw: String,
        importanceRaw: String,
        riskRaw: String,
        isRecurrent: Boolean,
        recurrenceIntervalRaw: String,
    ): ValidationResult {
        val errors = mutableMapOf<String, String>()

        val title = titleRaw.trim()
        when {
            title.isEmpty() -> errors["title"] = "Title is required."
            title.length > MAX_TITLE_LENGTH -> errors["title"] = "Title must be 100 characters or fewer."
        }

        val dueDate: LocalDate? = if (dueDateRaw.isBlank()) {
            errors["dueDate"] = "Due date is required."
            null
        } else {
            try {
                LocalDate.parse(dueDateRaw, dateFormat)
            } catch (e: DateTimeParseException) {
                errors["dueDate"] = "Invalid date format."
                null
            }
        }

        val importance = parseIntInRange(importanceRaw, "importance", errors)

        val risk = parseIntInRange(riskRaw, "risk", errors)

        var recurrenceInterval = 0
        if (isRecurrent) {
            recurrenceInterval = when (val parsed = recurrenceIntervalRaw.toIntOrNull()) {
                null -> {
                    errors["recurrenceInterval"] = "Invalid recurrence interval."
                    0
                }
                else -> {
                    if (parsed < 1) {
                        errors["recurrenceInterval"] =
                            "Recurrence interval must be at least 1 day for recurrent tasks."
                    }
                    parsed
                }
            }
        }

        val description = descriptionRaw.trim().ifEmpty { null }

        if (errors.isNotEmpty() || dueDate == null || importance == null || risk == null) {
            return ValidationResult(false, errors, null)
        }

        return ValidationResult(
            isValid = true,
            errors = emptyMap(),
            input = TaskInput(
                title = title,
                description = description,
                isRecurrent = isRecurrent,
                dueDate = dueDate,
                recurrenceInterval = recurrenceInterval,
                importance = importance,
                risk = risk,
            ),
        )
    }

    private fun parseIntInRange(
        raw: String,
        field: String,
        errors: MutableMap<String, String>,
    ): Int? = when (val parsed = raw.toIntOrNull()) {
        null -> {
            errors[field] = if (field == "importance") "Importance is required." else "Risk is required."
            null
        }
        else -> {
            if (parsed < MIN_SCORE || parsed > MAX_SCORE) {
                errors[field] =
                    if (field == "importance") "Importance must be between 1 and 5."
                    else "Risk must be between 1 and 5."
                null
            } else {
                parsed
            }
        }
    }
}
