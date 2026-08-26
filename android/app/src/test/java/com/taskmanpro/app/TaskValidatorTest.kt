package com.taskmanpro.app.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskValidatorTest {

    private fun validate(
        title: String = "Valid Title",
        description: String = "",
        dueDate: String = "2026-09-01",
        importance: String = "3",
        risk: String = "3",
        isRecurrent: Boolean = false,
        recurrenceInterval: String = "7",
    ): ValidationResult = TaskValidator.validate(
        titleRaw = title,
        descriptionRaw = description,
        dueDateRaw = dueDate,
        importanceRaw = importance,
        riskRaw = risk,
        isRecurrent = isRecurrent,
        recurrenceIntervalRaw = recurrenceInterval,
    )

    @Test
    fun valid_task_passes() {
        val result = validate()
        assertTrue(result.isValid)
        assertNotNull(result.input)
        assertEquals("Valid Title", result.input!!.title)
    }

    @Test
    fun empty_title_fails() {
        val result = validate(title = "   ")
        assertFalse(result.isValid)
        assertEquals("Title is required.", result.errors["title"])
    }

    @Test
    fun title_over_100_chars_fails() {
        val result = validate(title = "a".repeat(101))
        assertFalse(result.isValid)
        assertEquals("Title must be 100 characters or fewer.", result.errors["title"])
    }

    @Test
    fun title_at_100_chars_passes() {
        val result = validate(title = "a".repeat(100))
        assertTrue(result.isValid)
    }

    @Test
    fun missing_due_date_fails() {
        val result = validate(dueDate = "")
        assertFalse(result.isValid)
        assertEquals("Due date is required.", result.errors["dueDate"])
    }

    @Test
    fun invalid_due_date_fails() {
        val result = validate(dueDate = "not-a-date")
        assertFalse(result.isValid)
        assertEquals("Invalid date format.", result.errors["dueDate"])
    }

    @Test
    fun importance_out_of_range_fails() {
        assertEquals("Importance must be between 1 and 5.", validate(importance = "0").errors["importance"])
        assertEquals("Importance must be between 1 and 5.", validate(importance = "6").errors["importance"])
    }

    @Test
    fun importance_missing_fails() {
        assertEquals("Importance is required.", validate(importance = "").errors["importance"])
    }

    @Test
    fun risk_out_of_range_fails() {
        assertEquals("Risk must be between 1 and 5.", validate(risk = "0").errors["risk"])
        assertEquals("Risk must be between 1 and 5.", validate(risk = "6").errors["risk"])
    }

    @Test
    fun risk_missing_fails() {
        assertEquals("Risk is required.", validate(risk = "").errors["risk"])
    }

    @Test
    fun recurrent_with_zero_interval_fails() {
        val result = validate(isRecurrent = true, recurrenceInterval = "0")
        assertFalse(result.isValid)
        assertEquals(
            "Recurrence interval must be at least 1 day for recurrent tasks.",
            result.errors["recurrenceInterval"],
        )
    }

    @Test
    fun recurrent_with_invalid_interval_fails() {
        val result = validate(isRecurrent = true, recurrenceInterval = "abc")
        assertFalse(result.isValid)
        assertEquals("Invalid recurrence interval.", result.errors["recurrenceInterval"])
    }

    @Test
    fun recurrent_with_valid_interval_passes() {
        val result = validate(isRecurrent = true, recurrenceInterval = "14")
        assertTrue(result.isValid)
        assertEquals(14, result.input!!.recurrenceInterval)
    }

    @Test
    fun non_recurrent_ignores_interval() {
        val result = validate(isRecurrent = false, recurrenceInterval = "0")
        assertTrue(result.isValid)
        assertEquals(0, result.input!!.recurrenceInterval)
    }

    @Test
    fun blank_description_becomes_null() {
        val result = validate(description = "   ")
        assertTrue(result.isValid)
        assertNull(result.input!!.description)
    }
}
