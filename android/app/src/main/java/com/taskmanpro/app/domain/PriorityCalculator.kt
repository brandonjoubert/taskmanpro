package com.taskmanpro.app.domain

import java.time.LocalDate

object PriorityCalculator {

    const val URGENCY_OVERDUE = 5
    const val URGENCY_TODAY = 4
    const val URGENCY_TOMORROW = 3
    const val URGENCY_SOON = 2
    const val URGENCY_DEFAULT = 1

    /**
     * Port of the Flask `get_urgency`:
     *   overdue -> 5, today -> 4, tomorrow -> 3, within 3 days -> 2, else -> 1.
     */
    fun urgency(dueDate: LocalDate, today: LocalDate): Int = when {
        dueDate.isBefore(today) -> URGENCY_OVERDUE
        dueDate == today -> URGENCY_TODAY
        !dueDate.isAfter(today.plusDays(1)) -> URGENCY_TOMORROW
        !dueDate.isAfter(today.plusDays(3)) -> URGENCY_SOON
        else -> URGENCY_DEFAULT
    }

    /** Priority = urgency + importance + risk (parity with the web app). */
    fun priority(dueDate: LocalDate, today: LocalDate, importance: Int, risk: Int): Int =
        urgency(dueDate, today) + importance + risk
}
