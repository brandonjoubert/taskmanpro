package com.taskmanpro.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.taskmanpro.app.domain.PriorityCalculator
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskDetailScreen(
    viewModel: TaskViewModel,
    taskId: Long,
    onBack: () -> Unit,
    onEdit: () -> Unit,
) {
    val tasks by viewModel.activeTasks.collectAsState()
    val task = tasks.firstOrNull { it.task.id == taskId }

    if (task == null) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text("Task not found")
            Button(onClick = onBack) { Text("Back") }
        }
        return
    }

    val today = LocalDate.now()
    val urgency = PriorityCalculator.urgency(task.task.dueDate, today)
    val priority = task.priority
    var notes by remember { mutableStateOf(task.task.description ?: "") }
    var saved by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Task Detail") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = { viewModel.delete(task.task.id); onBack() }) {
                        Icon(Icons.Filled.Delete, contentDescription = "Delete")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(task.task.title, style = MaterialTheme.typography.headlineSmall)
            if (task.task.isRecurrent) {
                Text(
                    "Recurrent · every ${task.task.recurrenceInterval} days",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            Text(
                "Due: ${task.task.dueDate}",
                style = MaterialTheme.typography.bodyLarge,
            )
            Card {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        LabelValue("Priority", priority.toString())
                        LabelValue("Urgency", urgency.toString())
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        LabelValue("Importance", task.task.importance.toString())
                        LabelValue("Risk", task.task.risk.toString())
                    }
                }
            }
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it; saved = false },
                label = { Text("Notes") },
                modifier = Modifier.fillMaxWidth(),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { viewModel.saveNotes(task.task.id, notes); saved = true },
                ) { Text("Save Notes") }
                if (saved) {
                    Text("Saved", modifier = Modifier.padding(8.dp), color = MaterialTheme.colorScheme.primary)
                }
            }
            Button(
                onClick = { viewModel.complete(task.task.id); onBack() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Filled.CheckCircle, contentDescription = null)
                Spacer(Modifier.height(0.dp))
                Text("Mark Complete")
            }
        }
    }
}

@Composable
private fun LabelValue(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.titleMedium)
    }
}
