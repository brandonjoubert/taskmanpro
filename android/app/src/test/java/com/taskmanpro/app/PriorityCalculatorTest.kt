package com.taskmanpro.app.domain

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate

class PriorityCalculatorTest {

    private val today = LocalDate.of(2026, 8, 26)

    @Test
    fun urgency_overdue_is_5() {
        assertEquals(5, PriorityCalculator.urgency(LocalDate.of(2026, 8, 25), today))
        assertEquals(5, PriorityCalculator.urgency(LocalDate.of(2026, 1, 1), today))
    }

    @Test
    fun urgency_today_is_4() {
        assertEquals(4, PriorityCalculator.urgency(LocalDate.of(2026, 8, 26), today))
    }

    @Test
    fun urgency_tomorrow_is_3() {
        assertEquals(3, PriorityCalculator.urgency(LocalDate.of(2026, 8, 27), today))
    }

    @Test
    fun urgency_within_three_days_is_2() {
        assertEquals(2, PriorityCalculator.urgency(LocalDate.of(2026, 8, 28), today))
        assertEquals(2, PriorityCalculator.urgency(LocalDate.of(2026, 8, 29), today))
    }

    @Test
    fun urgency_beyond_three_days_is_1() {
        assertEquals(1, PriorityCalculator.urgency(LocalDate.of(2026, 8, 30), today))
        assertEquals(1, PriorityCalculator.urgency(LocalDate.of(2026, 12, 1), today))
    }

    @Test
    fun priority_is_urgency_plus_importance_plus_risk() {
        val due = LocalDate.of(2026, 8, 27) // urgency 3
        assertEquals(3 + 4 + 2, PriorityCalculator.priority(due, today, 4, 2))
    }
}
