package com.taskmanpro.app.data

import com.taskmanpro.app.domain.PriorityCalculator
import com.taskmanpro.app.domain.TaskInput
import kotlinx.coroutines.flow.Flow
import java.time.Instant
import java.time.LocalDate

data class TaskWithPriority(
    val task: TaskEntity,
    val priority: Int,
    val urgency: Int,
    val daysUntilDue: Long,
)

class TaskRepository(
    private val taskDao: TaskDao,
    private val completionDao: CompletionDao,
) {

    fun observeActiveTasks(): Flow<List<TaskEntity>> = taskDao.observeActiveTasks()

    fun observeById(id: Long): Flow<TaskEntity?> = taskDao.observeById(id)

    fun observeCompletions(): Flow<List<CompletionEntity>> = completionDao.observeAll()

    suspend fun observeCompletionsOnce(): List<CompletionEntity> = completionDao.getAllOnce()

    /** Computes the sorted active-task list with priorities, mirroring the web task_list. */
    suspend fun activeTasksWithPriority(today: LocalDate = LocalDate.now()): List<TaskWithPriority> {
        materializeRecurrentCopies(today)
        val tasks = taskDao.getAll().filter { !it.isCompleted }
        return tasks.mapNotNull { task ->
            val due = effectiveDueDate(task, today) ?: return@mapNotNull null
            val urgency = PriorityCalculator.urgency(due, today)
            val priority = urgency + task.importance + task.risk
            TaskWithPriority(
                task = task,
                priority = priority,
                urgency = urgency,
                daysUntilDue = if (due >= today) java.time.temporal.ChronoUnit.DAYS.between(today, due) else -1,
            )
        }.sortedWith(
            compareByDescending<TaskWithPriority> { it.priority }
                .thenBy { it.task.dueDate }
                .thenBy { it.task.id },
        )
    }

    /**
     * A recurrent task due within 7 days is materialised as a one-off copy,
     * deduplicated by (title, due date). Parity with the web task_list loop.
     */
    suspend fun materializeRecurrentCopies(today: LocalDate = LocalDate.now()) {
        val all = taskDao.getAll()
        val threshold = today.plusDays(7)
        for (task in all) {
            if (task.isRecurrent && !task.dueDate.isAfter(threshold)) {
                val existing = taskDao.findOneOffByTitleAndDue(task.title, task.dueDate)
                if (existing == null) {
                    taskDao.insert(
                        TaskEntity(
                            title = task.title,
                            description = task.description,
                            isRecurrent = false,
                            dueDate = task.dueDate,
                            recurrenceInterval = 0,
                            importance = task.importance,
                            risk = task.risk,
                            isCompleted = false,
                        ),
                    )
                }
            }
        }
    }

    fun effectiveDueDate(task: TaskEntity, today: LocalDate): LocalDate? =
        if (task.isCompleted) null else task.dueDate

    suspend fun createTask(input: TaskInput) {
        taskDao.insert(
            TaskEntity(
                title = input.title,
                description = input.description,
                isRecurrent = input.isRecurrent,
                dueDate = input.dueDate,
                recurrenceInterval = input.recurrenceInterval,
                importance = input.importance,
                risk = input.risk,
            ),
        )
    }

    suspend fun updateTask(id: Long, input: TaskInput) {
        val existing = taskDao.getById(id) ?: return
        taskDao.update(
            existing.copy(
                title = input.title,
                description = input.description,
                isRecurrent = input.isRecurrent,
                dueDate = input.dueDate,
                recurrenceInterval = input.recurrenceInterval,
                importance = input.importance,
                risk = input.risk,
                updatedAt = Instant.now(),
            ),
        )
    }

    suspend fun saveNotes(id: Long, description: String) {
        val existing = taskDao.getById(id) ?: return
        taskDao.update(existing.copy(description = description, updatedAt = Instant.now()))
    }

    /**
     * Completion semantics (parity with `complete_task`):
     *   - record a Completion for the scheduled due date (duplicate-guarded),
     *   - recurrent: create a completed one-off copy and advance the original
     *     due date by the interval,
     *   - one-off: mark isCompleted.
     */
    suspend fun completeTask(id: Long, today: LocalDate = LocalDate.now()) {
        val task = taskDao.getById(id) ?: return
        val due = effectiveDueDate(task, today) ?: return

        val existing = completionDao.findByTaskAndDue(task.id, due)
        if (existing != null) return

        completionDao.insert(
            CompletionEntity(
                taskId = task.id,
                scheduledDueDate = due,
                completedAt = Instant.now(),
            ),
        )

        if (task.isRecurrent && task.recurrenceInterval > 0) {
            taskDao.insert(
                TaskEntity(
                    title = task.title,
                    description = task.description,
                    isRecurrent = false,
                    dueDate = due,
                    recurrenceInterval = 0,
                    importance = task.importance,
                    risk = task.risk,
                    isCompleted = true,
                ),
            )
            taskDao.update(
                task.copy(
                    dueDate = due.plusDays(task.recurrenceInterval.toLong()),
                    updatedAt = Instant.now(),
                ),
            )
        } else {
            taskDao.update(task.copy(isCompleted = true, updatedAt = Instant.now()))
        }
    }

    suspend fun deleteTask(id: Long) {
        taskDao.getById(id)?.let { taskDao.delete(it) }
    }

    suspend fun deleteCompletion(id: Long) {
        completionDao.getById(id)?.let { completionDao.delete(it) }
    }
}
