package com.taskmanpro.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.taskmanpro.app.data.CompletionEntity
import com.taskmanpro.app.data.TaskRepository
import com.taskmanpro.app.data.TaskWithPriority
import com.taskmanpro.app.domain.TaskInput
import com.taskmanpro.app.domain.TaskValidator
import com.taskmanpro.app.domain.ValidationResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class TaskViewModel(
    private val repository: TaskRepository,
) : ViewModel() {

    private val _activeTasks = MutableStateFlow<List<TaskWithPriority>>(emptyList())
    val activeTasks: StateFlow<List<TaskWithPriority>> = _activeTasks.asStateFlow()

    private val _completions = MutableStateFlow<List<CompletionEntity>>(emptyList())
    val completions: StateFlow<List<CompletionEntity>> = _completions.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _activeTasks.value = repository.activeTasksWithPriority()
            _completions.value = repository.observeCompletionsOnce()
        }
    }

    fun create(
        title: String,
        description: String,
        dueDate: String,
        importance: String,
        risk: String,
        isRecurrent: Boolean,
        recurrenceInterval: String,
        onResult: (ValidationResult) -> Unit,
    ) {
        val result = TaskValidator.validate(
            titleRaw = title,
            descriptionRaw = description,
            dueDateRaw = dueDate,
            importanceRaw = importance,
            riskRaw = risk,
            isRecurrent = isRecurrent,
            recurrenceIntervalRaw = recurrenceInterval,
        )
        if (!result.isValid) {
            onResult(result)
            return
        }
        viewModelScope.launch {
            repository.createTask(result.input!!)
            refresh()
            onResult(result)
        }
    }

    fun update(
        id: Long,
        title: String,
        description: String,
        dueDate: String,
        importance: String,
        risk: String,
        isRecurrent: Boolean,
        recurrenceInterval: String,
        onResult: (ValidationResult) -> Unit,
    ) {
        val result = TaskValidator.validate(
            titleRaw = title,
            descriptionRaw = description,
            dueDateRaw = dueDate,
            importanceRaw = importance,
            riskRaw = risk,
            isRecurrent = isRecurrent,
            recurrenceIntervalRaw = recurrenceInterval,
        )
        if (!result.isValid) {
            onResult(result)
            return
        }
        viewModelScope.launch {
            repository.updateTask(id, result.input!!)
            refresh()
            onResult(result)
        }
    }

    fun complete(id: Long) = viewModelScope.launch {
        repository.completeTask(id)
        refresh()
    }

    fun delete(id: Long) = viewModelScope.launch {
        repository.deleteTask(id)
        refresh()
    }

    fun deleteCompletion(id: Long) = viewModelScope.launch {
        repository.deleteCompletion(id)
        refresh()
    }

    fun saveNotes(id: Long, notes: String) = viewModelScope.launch {
        repository.saveNotes(id, notes)
        refresh()
    }
}
